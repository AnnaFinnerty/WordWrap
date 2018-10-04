import json
import string

List3 = "/words/3letters.txt"
List3 = "/words/4letters.txt"
List5 = "/words/5letters.txt"

words_to_add = []
letters3_to_add = []
letters4_to_add = []
letters5_to_add = []

def process_file(file_path):
    with open(file_path) as fp:
        line = fp.readline()
        cnt = 1
        while line:
            for word in line.split():
                words_to_add.append(word)
                print word    
            line = fp.readline()
            cnt += 1
    fp.close()
    #print words_to_add
    process_word_list()
    
def process_word_list():
    for word in words_to_add:
        process_word(word)
    print letters3_to_add
    print letters4_to_add
    print letters5_to_add
    
def process_word(word):
    #print "Processing word " + word
    word.strip()
    l = len(word)
    if l == 3:
        letters3_to_add.append(word)
    elif l == 4:
        letters4_to_add.append(word)
    elif l == 5:
        letters5_to_add.append(word)
        
def check_word(word,doc):
    
    
def setup():
    letters = list(string.ascii_uppercase)
    newdict = {}
    for a in letters:
        newdict[a] = {}
        for b in letters:
            newdict[a][b] = {}        
    print newdict
    newdict = json.dumps(newdict)
    write_to_file(newdict)
    
    
def write_to_file(content):
    f = open("output.txt", "w")
    f.write(content)
    f.close()
