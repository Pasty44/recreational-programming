#!/usr/bin/python3

#
#   Calculates the word distribution across a set of .txt files
#
#   Prints out the top X most common words
#

import sys, re, glob
from collections import Counter

c = Counter()

# Regexes used to determine when we should start/stop counting words.
# We need this because Gutenberg files have default text at the start/end 
# of all their books, which we want to ignore
startRegex = re.compile(r'\*\*\*\s?START OF')
endRegex = re.compile(r'\*\*\*\s?END OF')

# Regex for removing everything except alphanumeric and whitespace characters
alphanumWhitespaceRegex = re.compile(r'([^\s\w]|_)+')

# The number of results to return from this script (sorted by descending count)
NUMBER_OF_RESULTS = 25
# Path and selector for txt files
PATH_AND_SELECTOR = "txts/*.txt"

for file in glob.glob(PATH_AND_SELECTOR):
    counting = False
    with open(file, 'r', errors = 'ignore') as txtFile:
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

# Create list of dicts with the words and their total count
dicts = [{'word':key, 'count':value} for key,value in c.items()]
countSum = sum(x['count'] for x in dicts)

# Sort the dicts and get the top X results
sortedTop = sorted(dicts, key=lambda k: -k['count'])[:NUMBER_OF_RESULTS]

# Print them out with this disgusting print statement
# Prints the word, its position in the list, it's ratio compared to the top result, and its raw count
print("\nTOTAL","{:,}".format(countSum),'\n')
for i,x in enumerate(sortedTop):
    print (
        '\t',x['word'],'\t',
        ' '+str(i+1)+' -' if (i+1<10) else str(i+1)+' -',
        '{:.2f}'.format(round(sortedTop[0]['count']/x['count'], 2)), '\t',
        "{:,}".format(x['count'])
    )
print()