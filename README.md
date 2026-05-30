# Scene3D Panel Plugin

Plugin based on @react-three/fiber https://r3f.docs.pmnd.rs/ and @react-spring https://react-spring.dev/


This is a Grafana plugin that adds the ability to create interactive 3D scenes within a Grafana panel.
When the panel is first loaded, you will see a 3D cube in the center of the scene. Camera controls are disabled by default. The editor has a **Scene3D** menu where each element of the 3D scene is configured. 

---


## 📋 Basic Element Settings

### 1. **Button for editing**
Assigns a key for editing an element inside the panel when hovering over it. When you hover your cursor over an element and press the specified key, a popup window will open for editing element parameters directly inside the panel.

### 2. **Element name**
The element name serves only to distinguish one element from another in the menu.

### 3. **Element type**
Element type - dropdown list to specify the element type.

**Supported types:**
- `cube` - cube
- `plane` - plane
- `sphere` - sphere
- `load gltf/glb` - load GLTF/GLB model
- `grid` - grid
- `text3d` - 3D text
- `text2d` - 2D text
- `Custom Element` - custom element

Depending on the selected type in **Elements Configuration**, the parameters for configuring each element will change.

---

## 🎨 Element Settings

### 4. **Visibility**
When enabled, a dropdown list with element visibility settings appears.

**Subsections:**
- **Use query for visibility** - switch that allows you to specify a query that will control element visibility when activated.
- **Regex when object is not visible** - specifies a regular expression that will check the last value from the query, and upon successful match will make the element invisible.

### 5. **Element transparency**
Sets element transparency. Value from `0` (fully transparent) to `1` (opaque).

### 7. **Color settings**
Controls element color. Contains multiple subsections:

**Main subsections:**
- **Use query for element color** - use query to determine element color
  - **Data for element color** - select data source for color
- **Use gradient for element color** - use gradient to color the element
  - **Use custom gradient** - use custom gradient
  - **Use data points for gradient** - use data points for gradient
- **Element color** - static element color (ColorPicker)
- **Center lines color** (for `grid` only) - color of grid center lines

**Gradient settings (when gradient with data points is enabled):**
- **Load coordinates from JSON file** - load point coordinates from JSON file
- **Gradient step** - gradient step (from 0 to 1)
- **Gradient resolution width/height** - gradient resolution
- **Gradient transparency** - gradient transparency (from 0 to 1)
- **Gradient type** - interpolation type: IDW, kriging, splain, RBF
  - **Kriging parameters:** Range, Nugget effect, Variogram plateau
  - **RBF parameters:** Shape parameter, Smoothing parameter, Basis function type (linear, gaussian, multiquadric, thinplate)
- **Point coordinates** - list of points with X, Y coordinates and data source for color

**Custom gradient (when "Use custom gradient" is enabled):**
- **Lower gradient boundary color** - lower boundary gradient color (HSL ColorPicker)
- **Upper gradient boundary color** - upper boundary gradient color (HSL ColorPicker)
- **Upper gradient boundary value** - upper boundary value
- **Lower gradient boundary value** - lower boundary value

### 8. **Cast shadows** / **Receive shadows**
Controls shadows for the element:
- **Cast shadows** - element casts shadows
- **Receive shadows** - element receives shadows from other objects

### 9. **Position settings**
Controls element position in 3D space:
- **X coordinate** - position along X axis
- **Y coordinate** - position along Y axis
- **Z coordinate** - position along Z axis

### 10. **Size settings**
Controls element dimensions:
- **Size X** - size along X axis (width)
- **Size Y** - size along Y axis (length/height)
- **Size Z** - size along Z axis (depth)

**Special parameters for different types:**
- **Sphere:**
  - **Sphere radius** - sphere radius
  - **Segments width** - number of segments along width
  - **Segments height** - number of segments along height
- **Text3d:**
  - **Font size** - font size
  - **Text depth** - text depth
- **Grid:**
  - **Number of cells** - number of cells

### 11. **Rotation settings**
Controls element rotation:
- **Rotation around X axis** - rotation around X axis (in radians)
- **Rotation around Y axis** - rotation around Y axis
- **Rotation around Z axis** - rotation around Z axis

### 12. **Custom Element settings** (for "Custom Element" type)
Allows creating custom shapes by defining polygon vertices.

### 13. **Render on both sides** (for `plane` and `Custom Element`)
Enables rendering both sides of plane/polygon.

### 14. **Add object borders**
Adds visible borders (wireframe) to the element.

**Border settings:**
- **Element border color** - border color
- **Element border thickness** - border line thickness

### 15. **Make object clickable**
Makes element clickable and allows opening links on double-click.

**Link settings:**
- **Enter link** - URL link to navigate to
- **Open in current window** - open link in current window (instead of new tab)

### 16. **Add text window**
Adds a popup text window for the element on hover or click. Full field reference: **[docs/TextSettings.md](docs/TextSettings.md)**.

### 17. **Add auxiliary information**
Adds additional information panel for the element.

---

## 🎭 Settings for Special Element Types

### **Text Element Settings** (for `text3d` and `text2d`)
- **JSON font URL** (text3d) - URL to load JSON font
- **Font** (text2d) - font name (e.g., "Arial")
- **Alignment** (text2d) - text alignment (left, center, right)
- **Element text** - text to display. Supports:
  - Data field substitution in curly braces `{fieldname}` — see **[Text Field Expressions](#-text-field-expressions)** for full syntax including math operations
  - Grafana variables `$variablename`
- **Smoothing** - text smoothing
- **Line height** - line height (in pixels)
- **Letter spacing** - letter spacing (in pixels)
- **Window size** (text2d) - text window size (in pixels)
- **Size** (text2d) - font size (in pixels)

### **Model Settings** (for `load fbx`, `load gltf/glb`, `load obj`, `load stl`)
- **Enter URL of object** - URL to load 3D model. Click **Apply** to apply.
- **Enable centering** - automatic model centering
- **Decompose object** - break model into component parts (subelements) for individual configuration
- **Add materials file** (OBJ only) - add materials file (.mtl)
  - **Path to materials** - path to .mtl file
- **Highlight elements on hover** - highlight elements on hover
  - **Highlight color** - highlight color

**Subelements** (when "Decompose object" is enabled):
Allows configuring color, transparency for each model part separately.

---

## 🌐 Global Panel Settings

### **Camera settings**
Controls cameras in the scene. You can add multiple cameras and switch between them.


**Main camera parameters:**
- **Camera name** - camera name
- **Camera type** - camera type
- **Position** - camera position (X, Y, Z)
- **Target position** - point the camera looks at (X, Y, Z)
- **Field of view (FOV)** - viewing angle
- **Zoom** - zoom level
- **Near/Far clipping plane** - near and far clipping planes

### **Lighting settings**
Controls light sources in the scene. You can add multiple light sources.

**Light types:**
- **Ambient** - ambient light (illuminates all objects evenly)
- **Directional** - directional light (sun)
- **Hemisphere** - hemisphere light (sky + ground)
- **Point** - point light (light bulb)
- **Rect Area** - rectangular area light
- **Spot** - spotlight (cone-shaped light)

**Main light parameters:**
- **Light name** - light source name
- **Light type** - light type
- **Light color** - light color
- **Intensity** - light intensity
- **Position** - source position (X, Y, Z) - for Point, Spot, Directional
- **Target position** - light direction - for Directional and Spot
- **Distance** - light range
- **Decay** - light decay with distance
- **Ground color** (Hemisphere) - ground light color
- **Sky color** (Hemisphere) - sky light color
- **Angle** (Spot) - spotlight cone angle
- **Penumbra** (Spot) - light edge blur

### **Canvas**

**Enable camera controls** - Enables mouse camera control:
- Rotation: left mouse button
- Panning: right mouse button or arrow keys
- Zoom: mouse wheel

**Show camera reset button** - Shows button to reset camera to initial position.

**Enable shadows** - Enables shadow rendering in the scene.
- **Shadow type** - shadow type: basic, percentage, soft, variance

**Change background color** - Change scene background color.
- **Background color** - background color selection (ColorPicker)

**Use background image** - Use image as background.
- **Image path** - URL or path to background image

**Add debug** - Adds debug information (FPS, memory usage, etc.)

**Add axis helper** - Adds coordinate axes helper (X=red, Y=green, Z=blue).
- **Axis helper settings:**
  - **Position** - axes position (top-right, top-left, bottom-right, bottom-left)
  - **Margin X/Y** - margins from edge
  - **Size** - axes size
  - **Points size** - points size on axes

**Add control elements** - Adds control elements (gizmo) for moving/rotating objects.
- **Size of control elements** - control elements size

**Add gradient** - Adds common gradient legend for the panel.
- **Gradient settings** - legend position, size and colors settings

---

## 🔧 Grafana Integration

### Using Data Queries
Many fields support dynamic values from Grafana queries:
- **Format:** `{fieldname}` where `fieldname` is the name of the data field (e.g. `Value`, `temperature`)
- **Variables:** `$variablename` to use Grafana variables
- **Example:** `{Value}` inserts the latest value of the `Value` field from your query

> **Legacy format** `{refId:fieldname}` (e.g. `{A:Value}`) is still supported for backward compatibility.

### Data-Based Visibility and Color
- Use **Use query for visibility** to show/hide elements based on data
- Use **Use query for element color** for dynamic color change
- Use **regex** for complex visibility conditions


---

## 🧮 Text Field Expressions

Anywhere text is displayed (`Element text`, text windows, subelement text), you can embed dynamic data values inside curly braces `{}` with optional math operations and number formatting.

### Basic Substitution

```
{fieldname}
```

Inserts the latest value of the named data field.

**Example:** `Temperature: {Value} °C`

### Math Operations

Apply arithmetic directly inside the braces:

```
{fieldname operator number}
```

| Operator | Description | Example |
|----------|-------------|---------|
| `+` | Addition | `{Value + 273.15}` |
| `-` | Subtraction | `{Value - 100}` |
| `*` | Multiplication | `{Value * 1000}` |
| `/` | Division | `{Value / 100}` |
| `^` | Power | `{Value ^ 2}` |
| `%` | Modulo (remainder) | `{Value % 60}` |

**Example:** `Power: {Value * 1000} W` — converts kW to W

### Number Formatting

Append `:.Nf` (or `:Nf`) after the field name or expression to round to `N` decimal places:

```
{fieldname:.Nf}
{fieldname operator number:.Nf}
```

| Format | Description | Example output |
|--------|-------------|----------------|
| `:.0f` | Integer (no decimals) | `42` |
| `:.1f` | 1 decimal place | `42.5` |
| `:.2f` | 2 decimal places | `42.50` |
| `:.3f` | 3 decimal places | `42.500` |

**Example:** `{Value / 1000:.2f} kW` — converts W to kW with 2 decimals

### Combined Expressions

Math and formatting can be used together:

```
{Value * 1000:.1f}
```

### Full Examples

| Expression | Description |
|------------|-------------|
| `{Value}` | Raw data value |
| `{Value:.2f}` | Rounded to 2 decimal places |
| `{Value * 100:.1f} %` | Value as percentage with 1 decimal |
| `{Value / 1000:.3f} kW` | Watts → kilowatts |
| `{Value + 273.15:.1f} K` | Celsius → Kelvin |
| `{Value ^ 2}` | Squared value |
| `Temp: {Value:.0f}°C` | Integer temperature |

### Grafana Variables

Use standard Grafana template variables anywhere in the text:

```
Rack: $rack_name  —  Load: {Value:.1f} %
```
Optimized WebGL: ~29k tris, 109 draw calls @ 60 FPS (typical laptop)
Variables (`$variablename`) are substituted first, then `{expressions}` are evaluated.

I AM NOT AUTHOR OF 3D MODELS

Map Pointer (3D Icon) https://sketchfab.com/3d-models/map-pointer-3d-icon-a30e2619537a425d90618ae5901c2989 author https://sketchfab.com/pravdin


Data center rack https://sketchfab.com/3d-models/data-center-rack-f178ec0a9c5f4605a5acbaaeb52dc721 author https://sketchfab.com/davit.png

Metal Door https://www.turbosquid.com/3d-models/commercial-steel-doors-1575549 author https://www.turbosquid.com/Search/Artists/at1012
data center map created with BlenderGIS https://github.com/domlysz/BlenderGIS 

Network Icons Pack 3D https://www.turbosquid.com/FullPreview/1796441 author https://www.turbosquid.com/Search/Artists/Ocstard


Cloud icon Cloud by Dicky Prayudawanto https://iconscout.com/free-3d-icon/free-cloud-3d-icon_7718646  author https://iconscout.com/contributors/dickpra 