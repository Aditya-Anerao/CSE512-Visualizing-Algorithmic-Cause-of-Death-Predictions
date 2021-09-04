library (data.table)
library (plyr)
library (dplyr)
library (knitr)

setwd ("C:/Users/Maggie/wsl/cse512_fp/FP-Visualizing-Algorithmic-Cause-of-Death-Predictions")

####===== DATA IMPORT =====
symp <- fread ("dev/data/symps_gs_text55.csv", header = T)
out <- fread ("dev/data/outcome_gs_text55.csv", header = T)
labels <- fread ("dev/data/PHMRC_symptoms.csv", header = T)

# Data clean
names (symp) <- labels$short_label [match (names (symp), labels$IHME_code)]
symp <- cbind (symp [, c(1,2,171)], ifelse (symp [,3:170] == "Y", 1, 0))
symp [is.na (symp)] <- 0

# Figure 1: Network
symp1 <- count (symp, location, Cause)
symp2 <- aggregate (. ~ location + Cause, data = symp, FUN=sum) 
symp3 <- merge (symp1, symp2, by = c ("location", "Cause"))
symp3 [5:172] <- lapply (symp3[5:172], function(x) x/symp3$n)

# ============================================================================================================
#AP, Bohol, Dar, Mexico, Pemba, UP

AP <- symp3 [symp3$location == "AP",]
Causes <- cbind (name = AP$Cause, zone = 0)
Symptoms <- cbind (name = colnames (AP) [5:172], zone = 1)
AP_Nodes <- rbind (Causes, Symptoms)
colnames (AP_Nodes) <- c ("id", "group")

AP_Links <- AP [, c(2,4:172)]
library (reshape2)
AP_Links <- melt (AP_Links[,c(1,3:170)], id.vars = "Cause")
colnames (AP_Links) <- c ("source", "target", "weight")
AP_Links <- AP_Links[order(AP_Links$source),]
AP_Nodes <- as.data.frame (AP_Nodes)

library (jsonlite)
AP_Nodes$group <- as.numeric (AP_Nodes$group)
#AP_Links[AP_Links == 0] <- NA
#AP_Links <- AP_Links [AP_Links$weight != 0,]

list = list ("nodes" = AP_Nodes, "links" = AP_Links)
json = toJSON (list, pretty = T)
write(json, "docs/dataLocation/AP_55_new.json")

