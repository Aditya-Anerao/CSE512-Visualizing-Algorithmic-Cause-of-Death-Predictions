# load library
library(dplyr)
library(stringr)
library(reshape2)
library(plyr)

# load data
outcome = read.csv("/Users/chethanjujjavarapu/Desktop/GitHub/FP-Visualizing-Algorithmic-Cause-of-Death-Predictions/dev/data/outcome_gs_text55.csv")
symptoms = read.csv("/Users/chethanjujjavarapu/Desktop/GitHub/FP-Visualizing-Algorithmic-Cause-of-Death-Predictions/dev/data/symps_gs_text55.csv")

# add cause to outcome table
sympSubset = symptoms %>% dplyr::select(ID, Cause)
outcomeMerged = merge(outcome, sympSubset, by="ID")
outcomeMerged$ID = NULL

# aggregate algorithm results within a cause
uniqueCauses = unique(outcomeMerged$Cause)
ls = list()
for (cause in uniqueCauses) {
  causeCleaned = str_replace_all(cause, "[[:punct:]]| ", ".")
  if (causeCleaned %in% colnames(outcomeMerged)) {
    outcomeMergedSubset = outcomeMerged %>% dplyr::filter(Cause == cause) %>% dplyr::select(algorithm, causeCleaned)
    algorithmAverages = aggregate(outcomeMergedSubset[,2], list(outcomeMergedSubset$algorithm), mean)
    algorithmAverages$Cause = cause
    algorithmAveragesPivoted = dcast(algorithmAverages, Cause ~ Group.1, value.var = "x")
    ls[[length(ls)+1]] = algorithmAveragesPivoted
  }
}
outcomeAggregated = ldply(ls)
write.csv(outcomeAggregated, "/Users/chethanjujjavarapu/Desktop/GitHub/FP-Visualizing-Algorithmic-Cause-of-Death-Predictions/algorithmAggregation/outcome_55_aggregated.csv")
