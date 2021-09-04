Hi, see attached data/results/codes. There are three levels, gs_34, gs_46, and gs_55. We typically work with the 34 categories, but I ran all three versions in case (so that would be what I described as option 1). You can always just pick one level of results, then aggregate the results directly so that you can choose more flexible groupings (i.e., the option 2). 

- symps_gs_XX.csv: the symptoms and causes, can be linked to outcome file by ID. They differ slightly since I only used causes with at least 30 observations.
- outcome_gs_XX.csv: the results in the form of Probability(cause of death for observation i is cause k), for three algorithms. 
- PHMRC_symptoms.csv: codebook of symptoms 
- run.R: code that generate the first two sets of files.

Hope this helps,
Richard