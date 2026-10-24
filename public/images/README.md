# Adding your own driver and race images

Add images as JPEG files using the IDs used in the F1 data feed:

- Drivers: `public/images/drivers/<driver-id>.jpg`
- Races: `public/images/races/<circuit-id>.jpg`

For example, `public/images/drivers/max_verstappen.jpg` is used for Max Verstappen, and `public/images/races/monza.jpg` is used for the Italian Grand Prix at Monza.

The driver ID and circuit ID are visible in the profile URL. If a local image has not been added yet, the site uses a stock-photo fallback. Driver cards, driver profiles, race cards, upcoming-race banners, and race detail pages all share these image paths.

Use images you have permission to publish. Crop driver portraits vertically and race imagery wide for the best results.
