# This repo's purpose

I made this repo to go along with a Medium article I wrote:

> ## Recreational programming: a zero dependency Zipf’s Law adventure

You can find it under my medium articles: https://medium.com/@andrew.dinihan

It is not a meant to be a robust, high quality application designed to be used by others, but simply a small, casual project used to investigate Zipf's law. There are no module/package dependencies (that was part of this project's purpose), so all you need is Node and Python 3. Make sure to read the article for the full context.

There are 2 main parts to the repo.

1. A webapp, which allows you to upload a plain text file and be shown the word count for the top most popular words.

2. A Python script designed to do some word count calculations on a set of text files so we can check for the existence of Zipf's law within the corpus.

# Webapp usage

I used Node 8 while making it, though there is minimal code so it should work with other versions. Simply run the server:

    node server.js

And navigate to the address in your browser. The `server.js` file contains the option to configure the port it runs on, check the configurables at the top of the file.

# Zipf's law Python script usage

To start, you'll want a collection of text files. If you don't have any, there's a script for scraping a bunch from the Gutenberg site, which is essentially a site that provides free books.

Simply navigate to the `gutenberg/` directory, run the `downloadZips.sh` script and let it run until you have enough. I found around 50MB was sufficient, beyond that I saw no change in the Zipfian pattern. Once you have the amount you need, simply `Ctrl+C` to stop the downloading.

Now just run `extractTxts.sh`, which unzips all the Gutenberg files and moves the text files into a separate folder, ready for processing.

Now that you have the text files, ensure the `multiFileWordCount.py` script is pointing to the folder containing those .txt files (it's the `PATH_AND_SELECTOR` configurable in that script). Also ensure that if you aren't using Gutenberg text files but some other corpus, change the counter updating to the non-Gutenberg logic (check the 'for each line' loop in the script, it's relatively self-explanatory). Once that's done, run the script!
    
    python3 multiFileWordCount.py

It should print out the top most common words, their position in the list, their count ratio (as compared to the top most common word) and finally their raw count.