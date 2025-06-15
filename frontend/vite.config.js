import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 3001,
//     allowedHosts:["hashproof.up.railway.app"],
//     proxy
//   }
// })

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	return {
		plugins: [react()],
		server: {
			port: 3001,
			allowedHosts: ["hashproof.up.railway.app"],
			proxy:{'/api':env.VITE_API_URL},
    },
	};
});
