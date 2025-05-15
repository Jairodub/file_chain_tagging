#[test_only]
module FileAuthLedger::file_auth_ledger_tests {
    use std::vector;
    use std::string;
    use aptos_framework::timestamp;
    use aptos_framework::account;
    use FileAuthLedger::file_auth_with_registry;

    // Test helper to create test file hash
    fun create_test_hash(value: vector<u8>): vector<u8> {
        let hash = vector::empty<u8>();
        vector::append(&mut hash, value);
        hash
    }

   #[test(admin = @0x1, user = @0x2)]
fun test_basic_file_registration(admin: signer, user: signer) {
        // Set up timestamp for testing
        timestamp::set_time_has_started_for_testing(&admin);
        // Set up test accounts
        let admin = account::create_account_for_test(@0x1);
        let user = account::create_account_for_test(@0x2);
        
        // Initialize registry and user store
        file_auth_with_registry::init_registry(&admin);
        file_auth_with_registry::init_user(&user);

        // Create test file data
        let file_hash = create_test_hash(b"test_file_1");
        let file_type = string::utf8(b"txt");
        let description = string::utf8(b"Test file");
        let tags = vector::empty<string::String>();
        vector::push_back(&mut tags, string::utf8(b"test"));

        // Register file
        file_auth_with_registry::register_file(
            &user,
            file_hash,
            vector::empty(), // No parent
            file_type,
            description,
            tags,
            1, // Owner-only permission
            @0x1 // Admin address
        );

        // Verify file exists
        assert!(file_auth_with_registry::is_file_registered(@0x1, file_hash), 1);

        // Verify owner
        let owner = file_auth_with_registry::get_file_owner_by_hash(@0x1, file_hash);
        assert!(owner == @0x2, 2);
    }

    #[test(admin = @0x1, owner = @0x2, other = @0x3)]
    #[expected_failure(abort_code = 25864, location = FileAuthLedger::file_auth_with_registry)]
    fun test_unauthorized_modification() {
        let admin = account::create_account_for_test(@0x1);
        let owner = account::create_account_for_test(@0x2);
        let other = account::create_account_for_test(@0x3);

        timestamp::set_time_has_started_for_testing(&admin);
    

        // Initialize
        file_auth_with_registry::init_registry(&admin);
        file_auth_with_registry::init_user(&owner);
        file_auth_with_registry::init_user(&other);

        // Create original file
        let original_hash = create_test_hash(b"original");
        file_auth_with_registry::register_file(
            &owner,
            original_hash,
            vector::empty(),
            string::utf8(b"txt"),
            string::utf8(b"Original"),
            vector::empty(),
            1, // Owner-only
            @0x1
        );

        // Try to create version as non-owner (should fail)
        let version_hash = create_test_hash(b"version_1");
        file_auth_with_registry::register_file(
            &other,
            version_hash,
            original_hash,
            string::utf8(b"txt"),
            string::utf8(b"Unauthorized"),
            vector::empty(),
            1,
            @0x1
        );
    }
}