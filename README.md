# School Widgets

Embeddable widgets for Norwegian VGS schools. Works with the [school-data](https://github.com/fredeids-metis/school-data) API.

## 🎨 Available Widgets

### 1. Programfag Katalog (v1)

Interactive catalog of programfag with search, filtering, and detailed views.

**CDN URLs:**
- JavaScript: `https://fredeids-metis.github.io/school-widgets/widgets/programfag-katalog/v1/catalog.js`
- CSS: `https://fredeids-metis.github.io/school-widgets/widgets/programfag-katalog/v1/styles.css`

**Usage:**

```html
<!-- In your HTML -->
<div id="programfag-catalog"></div>

<!-- Load CSS -->
<link rel="stylesheet" href="https://fredeids-metis.github.io/school-widgets/widgets/programfag-katalog/v1/styles.css">

<!-- Load JS and initialize -->
<script src="https://fredeids-metis.github.io/school-widgets/widgets/programfag-katalog/v1/catalog.js"></script>
<script>
  ProgramfagCatalog.init({
    schoolId: 'bergen-private-gymnas',
    container: '#programfag-catalog'
  });
</script>
```

**Configuration Options:**

- `schoolId` (required): School identifier (e.g., 'bergen-private-gymnas')
- `container` (required): CSS selector for container element
- `apiBaseUrl` (optional): Override API base URL (defaults to production API)

## 🏫 Supported Schools

- `bergen-private-gymnas` - Bergen Private Gymnas

## 📦 Future Widgets

- **Blokkskjema Velger** - Interactive block schedule selector
- **AI Chatbot** - AI-powered study advisor

## 🔗 Related Repositories

- [school-data](https://github.com/fredeids-metis/school-data) - Multi-school curriculum data API

## 🚀 Local Development

```bash
# Clone repository
git clone https://github.com/fredeids-metis/school-widgets.git
cd school-widgets

# Open demo in browser
open widgets/programfag-katalog/demo/demo.html
```

## 📝 Squarespace Integration

1. Add a Code Block to your page
2. Paste the embed code (see Usage above)
3. Replace `schoolId` with your school's ID
4. Publish

## 📄 License

MIT

## 👤 Maintainer

Fredrik (@fredeids-metis)
