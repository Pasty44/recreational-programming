cd zips

# Delete unneeded files fetched during wget
rm harvest*
rm robots.txt*

# Delete duplicates of files which just have different encoding
# These are distinguished by the dash and number after the ID
ls *-*.zip | xargs rm

unzip "*.zip"

mv *.txt ../txts