# Adding your own driver and race images

Add images using the IDs from the F1 data feed. Use the extension that matches the actual image format (JPEG `.jpg` or AVIF `.avif`):

- Drivers: `public/images/drivers/<driver-id>.jpg` or `.avif`
- Races: `public/images/races/<circuit-id>.jpg` or `.avif`

For example, `public/images/drivers/max_verstappen.jpg` is used for Max Verstappen, and `public/images/races/monza.jpg` is used for the Italian Grand Prix at Monza. Driver-name filenames are also supported, such as `public/images/drivers/Andrea_Kimi_Antonelli.jpg`.

The driver ID and circuit ID are visible in the profile URL. File names must match exactly, including spelling, underscores, and extension. If a local image has not been added yet, the site uses a stock-photo fallback. Driver cards, driver profiles, race cards, upcoming-race banners, and race detail pages all share these image paths.

Use images you have permission to publish. Crop driver portraits vertically and race imagery wide for the best results.
