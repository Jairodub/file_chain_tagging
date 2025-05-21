module FileAuthLedger::file_auth_with_registry {
    use aptos_framework::event;
    use aptos_framework::account;
    use aptos_framework::timestamp;
    use std::signer;
    use std::vector;
    use std::string;
    use std::table;

    // Error constants
    const EDUPLICATE_FILE: u64 = 25862;  // Make unique to avoid conflicts
    const EREAD_ONLY: u64 = 25863;
    const EUNAUTHORIZED: u64 = 25864;
    const EALREADY_REGISTERED: u64 = 25865;
    const ESTORE_NOT_INITIALIZED: u64 = 25866;
    const EINVALID_INPUT: u64 = 25867;
    const EINVALID_PERMISSION: u64 = 25868;

    // Events
    struct FileRegisteredEvent has drop, store {
        file_hash: vector<u8>,
        owner: address,
        timestamp: u64
    }

    struct FileVersionEvent has drop, store {
        file_hash: vector<u8>,
        parent_hash: vector<u8>,
        signer: address,
        timestamp: u64
    }

    /// Individual file version metadata
    struct FileEntry has copy, drop, store {
        file_hash: vector<u8>,
        root_hash: vector<u8>,
        owner: address,
        signer: address,
        timestamp: u64,
        parent_hash: vector<u8>,
        file_type: string::String,
        description: string::String,
        tags: vector<string::String>,
        permission: u8
    }

    /// List of versions for a file lineage
    struct FileHistory has copy, drop, store {
        versions: vector<vector<u8>>
    }

    /// Global file storage and registry with events
    struct FileStore has key {
        file_map: table::Table<vector<u8>, FileEntry>,
        history_map: table::Table<vector<u8>, FileHistory>,
        register_events: event::EventHandle<FileRegisteredEvent>,
        version_events: event::EventHandle<FileVersionEvent>
    }

    /// Global mapping: file_hash owner address
    struct FileRegistry has key {
        registry: table::Table<vector<u8>, address>
    }

    // Add this helper function to check if FileStore exists
    public fun store_exists(addr: address): bool {
        exists<FileStore>(addr)
    }


    /// Initialize user's file store
    public entry fun init_user(account: &signer) {
        let signer_addr = signer::address_of(account);
        assert!(!exists<FileStore>(signer_addr), EALREADY_REGISTERED);
        
        let store = FileStore {
            file_map: table::new(),
            history_map: table::new(),
            register_events: account::new_event_handle<FileRegisteredEvent>(account),
            version_events: account::new_event_handle<FileVersionEvent>(account)
        };
    move_to(account, store);
}

    /// Initialize global file registry - called once by admin account
    public entry fun init_registry(account: &signer) {
        let reg = FileRegistry {
            registry: table::new<vector<u8>, address>()
        };
        move_to(account, reg);
    }

    /// Helper function to check if user can modify file
    public fun can_modify(entry: &FileEntry, addr: address): bool {
        entry.permission != 0 && (entry.permission == 2 || entry.owner == addr)
    }

    /// Helper function to check if user is owner
    public fun is_owner(entry: &FileEntry, addr: address): bool {
        entry.owner == addr
    }

    /// Register a new file or modified version
    public entry fun register_file(
        account: &signer,
        file_hash: vector<u8>,
        parent_hash: vector<u8>,
        file_type: string::String,
        description: string::String,
        tags: vector<string::String>,
        permission: u8,
        registry_admin: address
    )  acquires FileStore, FileRegistry  {
        let signer_addr = signer::address_of(account);
        assert!(exists<FileStore>(signer_addr), ESTORE_NOT_INITIALIZED);
    
        // Check parent authorization first
        if (!vector::is_empty(&parent_hash)) {
            let parent_owner = get_file_owner_by_hash(registry_admin, parent_hash);
            assert!(parent_owner == signer_addr, EUNAUTHORIZED);
        };
        
        // Then check file existence
        let store_ref = borrow_global_mut<FileStore>(signer_addr);
        assert!(
            !table::contains(&store_ref.file_map, file_hash),
            EDUPLICATE_FILE
        );
        // Validate inputs
        assert!(!vector::is_empty(&file_hash), EINVALID_INPUT);
        assert!(permission <= 2, EINVALID_PERMISSION);
        
        // let signer_addr = signer::address_of(account);
        // let store_ref = borrowGAS_LIMIT=2000_global_mut<FileStore>(signer_addr);

        // assert!(
        //     !table::contains(&store_ref.file_map, file_hash),
        //     EDUPLICATE_FILE
        // );

        let root_hash = file_hash;
        let file_owner = signer_addr;
        let current_time = timestamp::now_seconds();

        if (!vector::is_empty(&parent_hash)) {
            let parent = table::borrow(&store_ref.file_map, parent_hash);

            file_owner = parent.owner;
            root_hash = parent.root_hash;

            // Permission checks
            assert!(parent.permission != 0, EREAD_ONLY);
            assert!(parent.permission == 2 || signer_addr == parent.owner, EUNAUTHORIZED);

            let history_ref = table::borrow_mut(&mut store_ref.history_map, root_hash);
            vector::push_back(&mut history_ref.versions, file_hash);

            // Emit version event
            event::emit_event(&mut store_ref.version_events, FileVersionEvent {
                file_hash,
                parent_hash,
                signer: signer_addr,
                timestamp: current_time
            });
        } else {
            // New file = new root + new version list
            let history = FileHistory {
                versions: vector::singleton(file_hash)
            };
            table::add(&mut store_ref.history_map, file_hash, history);

            // Register file in global registry
            let registry_ref = borrow_global_mut<FileRegistry>(registry_admin);
            assert!(
                !table::contains(&registry_ref.registry, file_hash),
                EALREADY_REGISTERED
            );
            table::add(&mut registry_ref.registry, file_hash, signer_addr);

            // Emit registration event
            event::emit_event(&mut store_ref.register_events, FileRegisteredEvent {
                file_hash,
                owner: signer_addr,
                timestamp: current_time
            });
        };

        let entry = FileEntry {
            file_hash,
            root_hash,
            owner: file_owner,
            signer: signer_addr,
            timestamp: current_time,
            parent_hash,
            file_type,
            description,
            tags,
            permission
        };

        table::add(&mut store_ref.file_map, file_hash, entry);
    }

    /// Get a file record
    #[view]
    public fun get_file_record(account: address, file_hash: vector<u8>): FileEntry
        acquires FileStore {
        let store_ref = borrow_global<FileStore>(account);
        *table::borrow(&store_ref.file_map, file_hash)
    }


    /// Get full version history for a file root
    #[view]
    public fun get_file_history(account: address, root_hash: vector<u8>): FileHistory 
        acquires FileStore {
        let store_ref = borrow_global<FileStore>(account);
        *table::borrow(&store_ref.history_map, root_hash)
    }

    /// Look up owner from global registry using only file hash
    #[view]
    public fun get_file_owner_by_hash(registry_admin: address, file_hash: vector<u8>): address 
        acquires FileRegistry{
        let registry_ref = borrow_global<FileRegistry>(registry_admin);
        *table::borrow(&registry_ref.registry, file_hash)
    }

    /// Check whether a file exists in the global registry
    #[view]
    public fun is_file_registered(registry_admin: address, file_hash: vector<u8>): bool
        acquires FileRegistry {
        let registry_ref = borrow_global<FileRegistry>(registry_admin);
        table::contains(&registry_ref.registry, file_hash)
    }
}
