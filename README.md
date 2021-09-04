# Visualizing Algorithmic Cause of Death Predictions  
**Team Members:** Aditya Anerao, Maggie Dorr, Chethan Jujjavarapu, Andrew Teng

## Abstract  
Determining the cause of death is an important concern in areas where death commonly occurs outside of hospitals or healthcare facilities. As a result, various algorithms have been developed to predict these causes based on medical information, including symptoms that the patients exhibits. Verbal autopsy (VA) methods, a survey with a relative or close contact, are used to identify the leading cause of death in populations without adequate vital registration systems. VA algorithms leverage symptom-cause information (SCI) to associate symptoms with causes of death (CoD). However, these algorithms vary in accuracy, which can be improved by grouping CoD. In collaboration with Tyler McCormick (UW Statistics and Sociology Departments), we created interactive and dynamic visualizations that depict associations between SCI and CoD based on these algorithms to help policymakers and stakeholders in low resource areas visualize uncertainty in predictive models. Furthermore, we designed these visualizations to assist in understanding the cause-symptom relationships and algorithm performances.  

**Keywords:** Verbal Autopsy; Death Prediction; Cause of Death; Algorithms

## Resources
[Visualization](https://cse512-19s.github.io/FP-Visualizing-Algorithmic-Cause-of-Death-Predictions/) ||[Paper (.pdf)](https://github.com/cse512-19s/FP-Visualizing-Algorithmic-Cause-of-Death-Predictions/blob/master/docs/Paper.pdf)|| [Poster (.pdf)](https://github.com/cse512-19s/FP-Visualizing-Algorithmic-Cause-of-Death-Predictions/blob/master/docs/Poster_UpdatedFigures.pdf)  

## Approach and Visualizations
In conjunction with a Global Health project from Tyler McCormick (University of Washing) and Zehang Richard Li (Yale University), we obtained data from the Population Health Metrics Research Consortium (PHMRC), which contains 7,841 adult deaths across six distinct locations: (1) Andhra Pradesh, India; (2) Bohol, Philippines; (3) Dar es Salaam, Tanzania; (4) Mexico City, Mexico; (5) Pemba Island, Tanzania; and (6) Uttar Pradesh, India. All recorded deaths have VA data and expert confirmed CoD. The confirmed CoD are grouped in three levels consisting of 34, 46, and 55 causes.  

## Repository Structure  
`README.md`  
`docs/`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*This folder contains our up-to-date scripts, documents, and data.*  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`index.html`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`graphs.js`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`map.html`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`cities.csv`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`PosterPresentation.pdf`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Post_UpdatedFigures.pdf`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`Paper.pdf`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`img`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*This folder contains the image used to display a map.*  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`dataLocation/`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*This folder contains all the location and grouping files which are read into the visuals 1-3.*  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`averageProbability/`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*This folder contains the probability distributions used for visual 4.*  
`dev/`  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;*This folder contains older code used during initial development.*  

## Work Distribution and Process

### Leadership

Maggie was team leader, responsible for primary communication with collaborators, delegating work load,and assuring we met milestones.

### Data Preprocessing

Andrew and Aditya were in-charge of data cleaning. To visualize cause of death-symptom relationships, Andrew aggregated all cause of death-symptom relationships across all patients within a given region and grouping. The end result was a new table that indicated each unique cause of death-symptom relationship along with a numerical value that was the frequency of this relationship divided by total # of relationships. Figures 1-3 visualized this information. To compare the performance of algorithms at predicting cause of death from symptom information, Aditya averaged probabilities for each cause for each algorithm. This information is presented in Figure 4.

### Data Visualization

Each member was in-charge of one of the four figures. Andrew built the network, Chethan built the parallel coordinate system, Maggie built the heatmap, and Aditya built the bar graph. 

### Non-Coding Work

#### Paper

Each member contributed to writing the paper.

#### Website

Each member added instructional text for their figure to the website. Chethan added the use-case text to the website. 

#### README

Chethan and Maggie wrote the README file.

#### Poster

Chethan and Andrew worked on the poster. In addition, each member wrote a description for their figure. 

#### Proofreading

Maggie proofread and made corrections and improvements to all written material.
