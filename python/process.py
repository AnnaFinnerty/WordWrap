import json

List3 = "/words/3letters.txt"
List3 = "/words/4letters.txt"
List5 = "/words/5letters.txt"

words_to_add = []

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
    print words_to_add
    process_word_list()
    
def process_word_list():
    for word in words_to_add:
        process_word(word)
    
def process_word(word):
    print "Processing word " + word
    word.strip()
    
def empty_array:
    
    
def write_to_file(file):
    
