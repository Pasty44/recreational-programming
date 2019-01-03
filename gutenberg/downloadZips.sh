mkdir zips txts

# Download Gutenberg zips containing english .txt files
wget -m -H -nd -P ./zips/ "http://www.gutenberg.org/robot/harvest?filetypes[]=txt&langs[]=en"