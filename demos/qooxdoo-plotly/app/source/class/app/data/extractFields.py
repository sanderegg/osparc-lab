import csv
import json

filenameIn = "outputController.dat"
filenameOut1 = "outputControllerOut.dat"
filenameOut2 = "outputControllerOut.json"
nFields = 8

minimized = []
with open(filenameIn, 'rb') as csvFileR:
	reader = csv.reader(csvFileR, delimiter="\t")
	for row in reader:
		minimized.append(row[0].split()[0:nFields-1])
		
print len(minimized)
print minimized[0]
print minimized[len(minimized)-1]

with open(filenameOut1, 'wb') as csvFileW:
	minWriter = csv.writer(csvFileW, delimiter=',')
	minWriter.writerows(minimized)

with open(filenameOut2, 'wb') as jsonFileW:
	json.dump(minimized, jsonFileW)