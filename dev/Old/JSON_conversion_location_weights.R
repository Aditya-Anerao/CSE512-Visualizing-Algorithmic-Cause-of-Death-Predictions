library (data.table)
library (plyr)
library (dplyr)
library (knitr)

setwd ("Desktop/Projects/FP-Visualizing-Algorithmic-Cause-of-Death-Predictions")

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
AP <- symp3 [symp3$location == "AP",]
Causes <- cbind (name = AP$Cause, zone = 0)
Symptoms <- cbind (name = colnames (AP) [5:172], zone = 1)
AP_Nodes <- rbind (Causes, Symptoms)
AP_Nodes1 <- cbind (AP_Nodes, id = seq.int (nrow (AP_Nodes))-1)
colnames (AP_Nodes1) <- c ("name", "group", "id")

AP_Links <- AP [, c(2,4:172)]
AP_Links$ID <- seq.int (nrow (AP_Links))-1
colnames (AP_Links) <- c ("","Cause_ID",seq (from = nrow (AP_Links), to = ncol (AP_Links)+nrow (AP_Links)-3))
library (reshape2)

AP_Links <- melt (AP_Links[,c(2:170)], id.vars = "Cause_ID")
colnames (AP_Links) <- c ("source", "target", "weight")

library (jsonlite)
AP_Nodes2 <- as.data.table (AP_Nodes1)
AP_Nodes2$group <- as.numeric (AP_Nodes2$group)
AP_Nodes2$id <- as.numeric (AP_Nodes2$id)

AP_Links$target <- as.numeric (as.character (AP_Links$target))
AP_Links <- AP_Links [AP_Links$weight != 0,]
AP_Nodes2$intensity <- as.numeric (c (table (AP_Links$source), table (AP_Links$target))) #Not enitrely accurate

list = list ("nodes" = AP_Nodes2, "links" = AP_Links)
json = toJSON (list, pretty = T)
write(json, "AP_Nodes_Links_new.json")


#### ================ Repeat for below (TO DO) ============================================================
Bohol <- symps3 [symps3$location == "Bohol",]
Bohol$ID <- seq.int (nrow (Bohol))
Dar <- symps3 [symps3$location == "Dar",]
Dar$ID <- seq.int (nrow (Dar))
Mexico <- symps3 [symps3$location == "Mexico",]
Mexico$ID <- seq.int (nrow (Mexico))
Pemba <- symps3 [symps3$location == "Pemba",]
Pemba$ID <- seq.int (nrow (Pemba))
UP <- symps3 [symps3$location == "UP",]
UP$ID <- seq.int (nrow (UP))



# Figure 2 
out_merged <- merge (symp [,c(1,2,171)], out, by ="ID")