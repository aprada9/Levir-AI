# Update Levir AI to the latest version

To update Levir AI to the latest version, follow these steps:

## Docker Installation

1. Clone the latest version of Levir AI from GitHub:

   ```bash
   git clone https://github.com/alvarodeprada/Levir-AI.git
   ```

2. Navigate to the project directory.

3. Check for changes in the configuration files. If the `sample.config.toml` file contains new fields, delete your existing `config.toml` file, rename `sample.config.toml` to `config.toml`, and update the configuration accordingly.

4. Pull the latest images from the registry.

   ```bash
   docker compose pull
   ```

5. Update and recreate the containers.

   ```bash
   docker compose up -d
   ```

6. Once the command completes, go to http://localhost:3000 and verify the latest changes.

## Non-Docker Installation

1. Clone the latest version of Levir AI from GitHub:

   ```bash
   git clone https://github.com/alvarodeprada/Levir-AI.git
   ```

2. Navigate to the project directory.

3. Check for changes in the configuration files. If the `sample.config.toml` file contains new fields, delete your existing `config.toml` file, rename `sample.config.toml` to `config.toml`, and update the configuration accordingly.

4. Execute `npm i` in both the `ui` folder and the root directory.

5. Once the packages are updated, execute `npm run build` in both the `ui` folder and the root directory.

6. Finally, start both the frontend and the backend by running `npm run start` in both the `ui` folder and the root directory.

---
