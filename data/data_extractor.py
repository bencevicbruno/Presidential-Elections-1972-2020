import os

ROOT = "/Users/brunobencevic/Desktop/Vizualizacija podataka - KV/data/raw_data"
didPrintCountryNames = False

def createCSVLine(data):
    country_name = data[0]
    total_votes = data[1].replace(',', '')
    dem_votes = data[2].replace(',', '')
    rep_votes = data[5].replace(',', '')

    if "CD-" in country_name:
        return None
    else:
        return f"{country_name},{total_votes},{dem_votes},{rep_votes}\n"

def getFileName(file_path):
    after_last_slash = file_path.split('/')[-1]
    before_dot = after_last_slash.split('.')[0]

    return before_dot

def extractData(file_path):
    global ROOT
    csv_lines = []
    csv_lines.append("countryName,totalVotes,demoVotes,repVotes\n")
    
    with open(file_path, "r") as file:
        lines = file.readlines()

        for line in lines:
            csv_line = createCSVLine(line.split('\t'))
            if csv_line != None:
                csv_lines.append(csv_line)

    with open(f'{ROOT}/{getFileName(file_path)}.csv', 'w') as file:
        file.writelines(csv_lines)
    print(f'Written {len(csv_lines)} for {getFileName(file_path)}')

for path, subdirs, files in os.walk(ROOT):
    for name in files:
        fullpath = os.path.join(path, name)
        if "votes" in fullpath and ".txt" in fullpath:
            extractData(fullpath)
