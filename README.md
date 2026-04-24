# JSON Server Setup

This project uses JSON Server as a lightweight mock backend.

## Run the server

```bash
npm run server
```

To change the API base URL, update `API_BASE_URL` in [common/url.js](E:/Intern/games%20website/Game/common/url.js).

The `server` script uses `npx json-server`, so it stays lightweight and does not need any backend code.

## Collections

- `contactusdata` for contact form submissions
- `authdata` for admin user data

## REST endpoints

JSON Server creates these automatically:

- `GET /contactusdata`
- `POST /contactusdata`
- `GET /contactusdata/:id`
- `PUT /contactusdata/:id`
- `PATCH /contactusdata/:id`
- `DELETE /contactusdata/:id`
- `GET /authdata`
- `POST /authdata`
- `GET /authdata/:id`
- `PUT /authdata/:id`
- `PATCH /authdata/:id`
- `DELETE /authdata/:id`

## Folder structure

- `admin/` for admin panel files
- `assets/` for css, js, and images
