# show.lucheestiy.com

Visual whiteboard and module designer for planning features for biznes.lucheestiy.com.

## Technical Information

| Parameter | Value |
|-----------|-------|
| Domain | show.lucheestiy.com |
| Port | 8110 |
| Type | Static HTML + CSS + JavaScript |
| Container | nginx:1.25-alpine |
| Path | /home/mlweb/show.lucheestiy.com |

## Purpose

This site serves as a visual "whiteboard" for administrators and developers to:
- Design and prototype new modules for biznes.lucheestiy.com
- Visualize how features will look before implementation
- Get step-by-step implementation guides
- Export implementation plans as markdown files

## Structure

```
show.lucheestiy.com/
├── docker-compose.yml      # Docker configuration
├── nginx/
│   └── default.conf        # Nginx configuration
├── html/                   # Web content
│   ├── index.html          # Main designer page
│   ├── templates.html      # Pre-built templates
│   ├── docs.html           # Documentation
│   ├── examples.html       # Live examples
│   ├── css/
│   │   └── style.css       # Main styles
│   └── js/
│       └── main.js         # JavaScript functionality
└── CLAUDE.md               # This file
```

## Available Modules

- **AI Assistant** - Intelligent chatbot for customer support
- **CRM Dashboard** - Customer relationship management
- **Analytics** - Track and visualize user behavior
- **Notifications** - Push and in-app notifications
- **Payments** - Payment processing integration
- **Authentication** - User login and registration

## Management

```bash
# Start
cd /home/mlweb/show.lucheestiy.com
docker compose up -d

# Stop
docker compose down

# Rebuild
docker compose up -d --build

# View logs
docker compose logs -f
```

## Usage

1. Open https://show.lucheestiy.com
2. Drag modules from the left sidebar to the canvas
3. View visual previews of each module
4. Check implementation steps in the right panel
5. Export the plan as a markdown file
