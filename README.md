# [kubinet.dev](https://kubinet.dev)

`kubinet.dev` is a personal website project with blog features, based on Next.js. It's a small digital corner for me to write down my thoughts. You can think of it as both a personal portfolio and a notebook.

## Running and Setting Up the Project

You can follow the steps below to run the project on your local machine or deploy it to a server.

### 1. Installing Necessary Dependencies

After downloading the project files, open your terminal in the project's root directory and run the following command to install all necessary packages:

```bash
npm install
```

### 2. Running in Development Environment

To start the project in development mode, use the following command:

```bash
npm run dev
```

This command usually starts the project at `http://localhost:3000`.

### 3. Building the Project (Preparation for Production)

Before deploying the project to a production environment, you need to create an optimized version. Run the following command for this:

```bash
npm run build
```

This command will create the `build` version of the project in the `.next` folder.

### 4. Running in Production Environment

After building the project, use the following command to start it in production mode:

```bash
npm run start
```

As defined in the `package.json` file, this command will start the project on port `3001` by default (`next start -p 3001`).

If you want to run the project on a different port, you can edit the `start` command in the `scripts` section of your `package.json` file. For example, if you remove the `-p 3001` part, Next.js will use port `3000` by default. You can also specify a different port using `-p <your_desired_port_number>`.

Example relevant line in `package.json`:
```json
// ...
"scripts": {
  // ...
  "start": "next start -p 3001",
  // ...
},
// ...
```

## Supabase Setup

This document explains how to set up Supabase integration for the `kubinet.dev` project.

### Steps

1.  **Create a New Project**:
    *   Go to the [Supabase Dashboard](https://app.supabase.com) and create a new project.

2.  **Set Up Database Schema**:
    *   In the Supabase Dashboard, go to the **SQL Editor**.
    *   Copy the content of the `schema.sql` file (this file is expected to be in the project; if not, you may need to create it manually).
    *   Paste it into the SQL Editor and run it.

3.  **Get URL and Keys**:
    *   Go to Project settings > **API** page.
    *   Copy the "anon" / "public" key and the URL.
    *   Add this information to a file named **`.env.local`** in your project's root directory in the following format:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
        NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
        NEXT_PUBLIC_KUBI_KEY=<your-chosen-secret-key>
        ```

4.  **Create User**:
    *   In the Supabase Dashboard, go to Authentication > **Users** section.
    *   Create the site's user with the "Create User" option (by setting an email and password).
    *   **Note**: Since this project is designed for a single user, features like registration are not enabled. Ensure that Supabase's "Allow new users to sign up" setting is turned off (under Authentication > Sign In / Providers > User Signups).

## Usage Features

This Supabase configuration provides the following basic functionality:

*   **Authentication**: Secure login system for the user.
*   **Blog Post Storage**: Database infrastructure for your blog posts.
*   **Page Content Management**: Dynamic management of content for the homepage and other static pages.
*   **Security Policies**:
    *   All visitors can read published blog posts.
    *   Only logged-in users can create new posts, and edit or delete existing ones.

## Security Notes

*   Always keep your `KUBI_KEY` and Supabase keys in secure environments.
*   **Never** expose your Supabase keys directly in your client-side (frontend) code. The `.env.local` file is used for this purpose and is managed securely by Next.js.
*   Ensure your API requests comply with the security rules (Row Level Security) you defined on the Supabase side.

## Page Content Management (`page_contents` Table)

The content of the homepage and other static pages is stored in a table named `page_contents`.

*   **Page Definition**:
    *   Each page is identified by a unique key called `page_key`.
    *   Example keys: `homepage` (for the homepage), `about` (for the about page), `contact` (for the contact page), etc.
*   **Content Editing Process**:
    *   An "Edit" button appears on relevant pages for logged-in users.
    *   Clicking this button opens a form to edit the page content.
    *   Users who are not logged in will not see the edit button.
*   **Default Contents**:
    *   When the database schema (`schema.sql`) is first set up, default content for some pages is automatically added.

## Site Customizations and Tips

*   **Changing Favicon**:
    *   The site's favicons are located in the `public/` folder.
    *   You can update the site icons by replacing the files in this folder (e.g., `favicon.ico`, `apple-touch-icon.png`, etc.) with your own icons.
*   **404 Page Management**:
    *   **GIFs**: GIFs randomly displayed on the not-found page (404) are managed from the `gifs` array in the `app/NotFoundPageContent.tsx` file. You can add different GIFs or change existing ones by updating this array.
    *   **Page Title**: The title of the 404 page displayed in the browser tab is set via the `metadata` object in the `app/not-found.tsx` file.
*   **Hidden Login Modal**:
    *   A login modal opens when you quickly click on the "kubinet.dev" text (usually found in the logo or site title) **three times** anywhere on the site.
    *   To log in, you will need to use the `NEXT_PUBLIC_KUBI_KEY` value defined in your `.env.local` file and the email and password of the user you created in Supabase.
*   **Markdown Support**:
    *   Blog posts and page content managed through the `page_contents` table support **Markdown** format. You can create your content in rich text format (headings, lists, bold/italic text, code blocks, etc.) using Markdown syntax.

## Todo

Features I plan to add to the project in the future:

- Ability to add comments to blog posts.
- Dynamically add new pages (e.g., "My Projects", "About Me") to the navigation bar (navbar). 