# CONVERTS SYMPTOMS_SUM_##.CSV TO JSON FORMAT

# LOAD LIBRARY
library(rjson)
library(dplyr)

# LOAD DATA
sympTable = read.csv("/Users/chethanjujjavarapu/Desktop/GitHub/FP-Visualizing-Algorithmic-Cause-of-Death-Predictions/dev/data/symptom_sum_48.csv")

# GET CAUSES AND SYMPTOMS
causes = sympTable$Cause
symp = colnames(sympTable) %>% .[!(. %in% c("location", "Cause", "count"))]

# CREATE NODE LIST
node = list()
for (cause in causes) {
  temp = list("id"=cause, "group"=1)
  node[[length(node)+1]] = temp
}
for (symptom in symp) {
  temp = list("id"=symptom, "group"=2)
  node[[length(node)+1]] = temp
}

# CREATE LINKS LIST
links = list()
for (i in 1:nrow(sympTable)) {
  row = sympTable[i,]
  rowColumnNames = colnames(row) %>% .[!(. %in% c("location", "Cause", "count"))]
  cause = row$Cause
  for (columnName in rowColumnNames) {
    temp = list("source"=cause, "target"=columnName, "value"=row[,columnName])
    links[[length(links)+1]] = temp
  }
}

# WRITE TO JSON
list = list("node"=node, "links"=links)
json = toJSON(list)
write(json, "/Users/chethanjujjavarapu/Desktop/GitHub/FP-Visualizing-Algorithmic-Cause-of-Death-Predictions/dev/symptom_sum_test.json")
