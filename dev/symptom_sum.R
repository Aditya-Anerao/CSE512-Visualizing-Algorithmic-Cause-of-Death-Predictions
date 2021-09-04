library(data.table)
library(plyr)
library(dplyr)
library(reshape)


options(digits=3)


setwd("C:/Users/Maggie/Documents/UW-BHI/CSE 512/a4") 

#Read-in data
symps <- fread("C:/Users/Maggie/Documents/UW-BHI/CSE 512/a4/symps_gs_text55.csv", header = TRUE, sep = ',')[,-1]

#Clean table
symps1 <- cbind(symps[,1], ifelse(symps[,2:169]=="Y", 1, 0))
#symps1 <- cbind(symps[,1], symps[,170], ifelse(symps[,2:169]=="Y", 1, 0))

#Total counts for each cause
symps2 <- summarise(group_by(symps1, Cause), count =n())

#Per symptom
symps3 <- aggregate(. ~ Cause, symps1, sum)
symps4 <- merge(symps2, symps3, by="Cause")
symps4[3:171] <- lapply(symps4[3:171], function(x) x/symps4$count)
write.csv(symps3, file="C:/Users/Maggie/Documents/UW-BHI/CSE 512/a4/symptom_sum_48.csv", sep=",", row.names=F, col.names=T)

#Write data for heatmap
sympsMelted <- melt(symps4, id=c("Cause","count"))
write.csv(sympsMelted, file="C:/Users/Maggie/Documents/UW-BHI/CSE 512/a4/symptom_sum_48_melt.csv", sep=",", row.names=F, col.names=T)
