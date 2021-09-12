# Image Scrambler - Chrome Extension
### Give yourself the option to download images with scrambled checksums.

In the age of operating systems that report the signatures of any images you download, new tools to fight for your privacy are needed.

**How it works** Once you install this extension, you'll see that a new option has appeared in your browser context menu when you right click an image. Clicking the new option will start the following process.

1. Obtain the image file in relevant formats (specifically `blob` and `arraybuffer`).
2. Create a temporary HTML5 canvas element and draw the image onto it.
3. Pass over every pixel in the image and change the pixel by 1 colour shade.
   - 10% chance that the pixel will change red, blue or green either up or down by 1 shade. (30% chance to change the pixel)
   - 70% chance that the pixel will remain unchanged.
4. Determine file type and attempt to guess a name 
   - If the file URL doesn't have an extension, it will just default to image.png, image.gif or image.jpeg.
5. Append a link to the bottom of the page and automatically click it, destroying it immediately after.

**This extension is only able to modify JPEG, PNG or GIF files. Other file types may be added eventually if it's possible.**

**Some CORS policies require you to be accessing the image from the host website. You will get a warning if this occurs and you just need to navigate directly to the image first.**

This is a proof of concept and not fool proof by any means. You would need to trust Google since this application can not intercept the response before it goes through the browser. The concept should be considered for implementation in privacy browsers like TOR for users in countries that have authoritarian governments. Checking image signatures *will* be misused in the future. It's only a matter of when and how.