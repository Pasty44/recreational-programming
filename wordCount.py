#!/usr/bin/python3

#
#   Script for calculating the count of each word in a plain text file
#   (File path is provided as first command line argument)
#
#   Returns an array of dicts of top X most common words. These dicts contain
#   the word, its count and what % of the total word count it makes (normalized 
#   between 0-100 so that it can be used as a CSS percentage width in the frontend)
#

import sys, re
from collections import Counter

c = Counter()

# Regexes used to determine when we should start/stop counting words.
# We need this because if we're procesing Gutenberg files, they all have 
# default text at the start/end of all their books, which we want to ignore
startRegex = re.compile(r'\*\*\*\s?START OF')
endRegex = re.compile(r'\*\*\*\s?END OF')

# Regex for removing everything except alphanumeric and whitespace characters
alphanumWhitespaceRegex = re.compile(r'([^\s\w]|_)+')

# The number of results to return from this script (sorted by descending count)
NUMBER_OF_RESULTS = 10

try:
    with open(sys.argv[1], 'r') as txtFile:
        counting = False
        for line in txtFile.readlines():
            # This is for use with any .txt file
            # line = re.sub(alphanumWhitespaceRegex, '', line.lower())
            # c.update(line.split())

            # This is for use with Gutenberg .txt files
            if not counting and startRegex.search(line):
                counting = True
            if counting and endRegex.search(line):
                counting = False
            
            line = re.sub(alphanumWhitespaceRegex, '', line.lower())
            if counting:
                c.update(line.split())

        # Create list of dicts with the words and total word count
        dicts = [{'word':key, 'count':value} for key,value in c.items()]
        countSum = sum(x['count'] for x in dicts)
        
        # Sort the dicts and get the top X results
        sortedTop = sorted(dicts, key=lambda k: -k['count'])[:NUMBER_OF_RESULTS]

        # For each result dict, add what % it makes up of all words
        # Also, delete quote characters so they don't mess up JSON parsing in frontend
        for x in sortedTop:
            x['percentage'] = (x['count']*100.0)/countSum
            x['word'] = x['word'].replace("'", "").replace('"', '')
        
        # Add the ratio of this result to the top result
        # Should roughly correspond to its index based on Zipf's Law
        for x in sortedTop:
            x['ratioToTopResult'] = '{:.2f}'.format(round(sortedTop[0]['count']/x['count'], 2))
        
        # If there's no values in sorted list, just return the empty list
        if len(sortedTop) == 0:
            print(sortedTop)
            sys.exit(0)

        # Normalize all results between 0 and 100, so they can be used as CSS % widths 
        # in the front end bar chart
        amountToMultiplePercentsBy = 100/sortedTop[0]['percentage']
        
        for x in sortedTop:
            x['percentage'] = round(x['percentage']*amountToMultiplePercentsBy,2)
        
        # Print the result, so it can be picked up by the node process stdout event handler
        print(sortedTop)

except Exception as e:
    # Print error message, so it can be picked up by the node process stderr event handler
    sys.stderr.write("Server error: {0}\n".format(e))
    sys.stderr.flush()