# Load package and data
library(openVA)
library(nbc4va)
raw <- read.csv(getPHMRC_url("adult"))
dim(raw)

# remove any causes with fewer than 50 observation
for(level in c("gs_text34", "gs_text46", "gs_text55")){
	causes <- names(which(table(raw[, level]) > 30))
	not_too_few <- which(raw[, level] %in% causes)
	data <- raw[not_too_few, ]
	dim(data)


	set.seed(12345)
	N <- dim(data)[1]
	is.train <- sample(1:N, round(N * 0.8))
	test <- data[-is.train, ]
	train <- data[is.train, ]
	dim(test)
	dim(train)


	# Fit four algorithms
	fit_tariff <- codeVA(data = test, data.type = "PHMRC", model = "Tariff",
	                  data.train = train, causes.train = level, 
	                  phmrc.type = "adult")

	fit_interva <- codeVA(data = test, data.type = "PHMRC", model = "InterVA", 
	                   data.train = train, causes.train = level, 
	                   phmrc.type = "adult")

	fit_nbc <- codeVA(data = test, data.type = "PHMRC", model = "NBC", 
	                   data.train = train, causes.train = level, 
	                   phmrc.type = "adult")

	fit_insilico <- codeVA(data = test, data.type = "PHMRC", model = "InSilicoVA",
	                    data.train = train, causes.train = level, 
	                    phmrc.type = "adult", 
	                    jump.scale = 0.05, convert.type = "fixed",
	                    Nsim=10000, auto.length = FALSE)

	symps <- ConvertData.phmrc(input = train, input.test = test, cause = level)$output.test
	symps$location <- test$site
	write.csv(symps, file = paste0("symps_", level, ".csv"), row.names = FALSE)

	prob1 <- data.frame(getIndivProb(fit_tariff))
	prob1 <- cbind(ID = rownames(prob1), algorithm = "Tariff", prob1)

	prob2 <- data.frame(getIndivProb(fit_interva))
	prob2 <- cbind(ID = rownames(prob2), algorithm = "InterVA", prob2)

	prob3 <- getIndivProb(fit_nbc)
	prob3 <- cbind(ID = prob3[,1], algorithm = "NBC", prob3[, -1])
	prob3 <- prob3[, match(colnames(prob2), colnames(prob3))]

	prob4 <- data.frame(getIndivProb(fit_insilico))
	prob4 <- cbind(ID = rownames(prob4), algorithm = "InSilicoVA", prob4)


	# I didn't put Tariff results since it is not probability scale; they are rankings, so less comparable with others
	outcome <- rbind(prob2, prob3, prob4)
	write.csv(outcome, file = paste0("outcome_", level, ".csv"), row.names = FALSE)


	outcome$top <- colnames(outcome)[-c(1,2)][apply(outcome[, -c(1,2)], 1, which.max)]
	outcome$cause <- symps[match(outcome$ID, symps$ID), "Cause"]
	outcome$acc <- outcome$top == outcome$cause
	print(aggregate(acc~algorithm, outcome, FUN = mean))
}


