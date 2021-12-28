# Gold Idea First Templates (GIFT)

## Overview

Reusable Data, Analytics and Visualization Templates internally known as DAVT at the CDC.

The project uses the DataBricks methodology of referencing system inputs as bronze data and system outputs as gold data.  Data transformations between bronze and gold are referred to as silver data.  The project is named gold idea first templates (GIFT) because a key principle of the architecture is to begin with the end in mind (gold data) and prioritize the ideas for generating end user output (gold data) first before delving into the technical details of expected bronze input.

The templates are designed to be data driven through end user configuration.  Creating new ETL processes or reports are designed to be self-service and not require knowledge of procedural programming such as Python.

![Delta-Lake-Multi-Hop-Architecture-Bronze](https://user-images.githubusercontent.com/2504540/147579076-395a7f22-fff7-490e-9cf8-847a2adfbd95.png)

## Getting Started

1. TODO

## Project Description

**Definition of Self Service** 

- Self Service means that a user should have the ability consume data, transform data, create reports and distribute them via email or SharePoint without any programming skills for simple reports.  Prescriptive templates, samples and training are provided both at the business and technical process level to guide users through creating  and deploying reports without code
- Self Service means that in more complex scenarios where code is used, the code will be declarative and simple as possible, either SQL, PowerBI or other end user declarative programming languages.  Users do not need to learn a procedural programming language such as SAS, Python,  R, etc. to develop self service reports.
- Users certainly can, and are encouraged to learn Python, R and other procedural languages to create complex AI models and predictive analytics.  However, for purposes here, the use of DataBricks and Jupyter notebooks by end users with procedural code is not considered Self Service.  This type of work is considered an IT pipeline.  Certainly end users are encouraged to be engaged and enabled in the development of IT pipelines.  The technicalities and complexities of IT pipelines, however, are out of scope for the GIFT project.  Personally, as a data architect working at the CDC for NCEZID, NCIRD and Chronic over the last 4 years on over 50 reports, I have never worked on a report where the reporting requirements I was responsible for could not be met by the self service model.

The following web pages shows the type of information that is configured in a self-service manner through SharePoint lists in the current architecture.

![CaptureSelfService](https://user-images.githubusercontent.com/2504540/147579107-65fa0f9b-797c-45a2-a94a-0ead7f1cfbcd.PNG)

**Definition of Data Driven**

- All program flow, scheduling, security, data documentation, discovery and data quality rules are data driven and administered through an online UX.  The UX should allow online data entry and ideally batch updates via Excel.

**Priorities and Approach**

The largest impact to projects implementing the DAVT templates is based on development process changes rather than technical changes.  All implementations of DAVT should have a functioning report available in the first week and usually the first few days.  Note this is not produced with real data unless the client has existing reports where the data can be pasted in Excel. 

The key rule in implementing DAVT is to begin with the end in mind.   For instance, during the first implementation of DAVT, the data from the current customer reports were pasted into Excel, analyzed and used to create a report mockup in the first three days loading from data from Excel files exported to csv format.  

When the current reports were analyzed two common pitfalls were discovered in the report:

- **Miracles:**  Much of the data the was in the current report such as captions, formulas, code lookups, etc. was not stored in any system.  The processes to implement the report were manual and only known by the author of the word or excel document.  Even some of the actual reported historical data was copy pasted from an old excel file each month and never stored in a formal system.  Much of the data was a "miracle" because the data appeared on report output but was never entered in a formal system.

- **Blackholes:**  Much, if not most of the data, that was fed into the system as input was never used on report output or external data feeds.  Some of the inputs may have been used in the past, but never formally deprecated.  Many of the blackholes were simply intermediate variables created by past report developers that were never removed.  In short, most of the data going into the system went into a blackhole and was never used on any current report output, feed or intermediate calculation.



**Business Need**

Over the last 4 years the DAVT team has worked with 
- 4 Centers
- 10 Projects
- 15 Project Areas
- 400 Best Practices

**Current Process**

There are currently few documented Data, Analytics and Visualization standards and naming conventions for business or technical processes across centers, projects and project areas.

**DMI Project Goals**

Uncover, document and work to optimize quality, security, efficiency and reuse across the over 5,000 opportunities for implementing best practices listed above. 

**Approach**

The DAVT architecture consists of business and technical processes and use cases that are implemented in a self service manner.  The templates are optimized for incremental deployment and changes to current systems do not require a "big bang" implementation to see business value.  A project could choose to implement Power BI best practices without migrating from SQL Server data to a DataBricks Delta Lake architecture or vice versa.  Similarly, business logic may be maintained in SAS before moving to  DataBricks SQL Analytics or reside in a combination of locations during the implementation process.  While many of the business best practice templates are optimized for Azure DevOps they can easily be ported to Jira.  The Azure DevOps repository best practices likewise can be implemented in GitLab. 

Indeed, there is an enormous business opportunity for implementing naming conventions and standardization of business processes using standard Microsoft Office 365 technology through applying conventions to Microsoft Teams as well as Microsoft SharePoint Document Libraries and Lists.  Other low to no code self service solutions offered in PowerAutomate and PowerBI can also deliver rapid business value.

**Overview**

The DAVT Platform provides a consistent architecture to create analytics and visualizations that can be shared across centers and published to the Enterprise Data and Visualization (EDAV) platform.

This project houses templates for Data, Analytics and Visualization that can be used in different centers such as NCIRD and NCEZID.  Some features of the architecture have also been evaluated by NCCDPHP (Chronic).  We are also in the process of deploying the gold output of certain projects to the EDAV centrally managed platform maintained by the OCIO.

**Need for Change**

Currently, the current DAVT processes are primarily implemented by one technical data architect from Peraton and one Data Manager/Data Modernization Initiative (DMI) lead from the NCIRD center.  It is not possible for such as a small team to move the needle on the current 5,000+ opportunities.  The current workload of building reports is not sustainable.  There are many opportunities for individuals to lead each of the phases and epics listed below.  The scope of the opportunity is far broader than a couple of individuals.


**Current Projects**

There are currently two platform projects and with 4 project areas implementing the templates in active development.  Two other platforms and four other projects have also started to evaluate elements of the architecture.

These projects contain over 50 reports that are in the process of onboarding to the architecture.

**NCIRD - NDSP**
- ndsp-pertussis
- ndsp-phlip
- ndsp-izdl-ddt
           - Data Curation
           - Vacadmin - Add / Update
           - Pharmacy 
           - DDT- Dozens of other reports

**NCEZID - EZDX**
- ezdx-foodnet-davt
- ezdx-legionella-davt (data driven report alerts)
- ezdx-ribd-davt (dictionary /mmg)

**NCCDPHP (Chronic)**
- lung-response (power query)
- pfs-partner portal (gantt chart)
- mmria - overdose (security)
- dph-cdi-davt (maps)

**OCIO - EDAV**
 - davt-analytics

**DAVT Best Practice Epics grouped by EPLC Phase**

The following template project plan outlines the implementation of DAVT Best Practices based on the CDC Enterprise Performance Life Cycle (EPLC) adapted for the Agile Scrum methodology.

**P1 -	Concept and Initiation**

  **- Deliverables**
  - P1_PBI1	Business Need Statement
  - P1_PBI2	Business Case
  - P1_PBI3	Decision on best approach to meet business need
  - P1_PBI4	Project Selection of Agile Method

  **- Reviews**
  - P1_R1	Architecture Review

**P2 - 		Preliminary Requirements and Design**

  **- Deliverables**

  - P2_PBI1	Project Roadmap & Release Plan
  - P2_PBI2	Preliminary Design
  - P2_PBI3	Security Risk Assessment
  - P2_PBI4	Agile Management Plan
  - P2_PBI5	Concept of Operations (conops)

  **- Reviews**

  - P2_R1	Integrated Baseline Review

**P3 -	Agile Development**

  **- Deliverables**

  - P3_PBI1	User Stories
  - P3_PBI2	Prioritized Backlog
  - P3_PBI3	Testing Results
  - P3_PBI4	Show & Tell User Acceptance
  - P3_PBI5	Compliance Checks
  - P3_PBI6	Packaged Product
  - P3_PBI7	Security Risk Assessment

  **- Reviews**

  - P3_R1	Agile Scrum Sprint Plan
  - P3_R2	Agile Scrum Sprint Retrospective


**P4 -	Final User Testing and Implementation**

  **- Deliverables**

  - P4_PBI1	Implementation Plan
  - P4_PBI2	SLAs / MOUs
  - P4_PBI3	End User Functionality
  - P4_PBI4	User Acceptance
  - P4_PBI5	Project Completion Report
  - P4_PBI6	Security Risk Assessment

  **- Reviews**

  - P4_R1	Readiness Review End User
  - P4_R2	Post-Implementation Review
  - P4_R3	Security Control Assessment
  - P4_R4	System Accreditation

**P5 -	Operations & Maintenance**

  **- Deliverables**

  - P5_PBI1	Annual Operational Analysis Report
  - P5_PBI2	Continued Authority to Operate
  - P5_PBI3	Security Risk Assessment

  **- Reviews**

  - P5_R1	Security Authorization
  - P5_R2	Annual Operational Analysis

**P6 -	Disposition**

  **- Deliverables**

  - P6_PBI1	Disposition Plan


## GIFT - Code Standards and Naming Conventions

**DevOps Branching**
1.	Currently using user->main->dev->qa->onboard->prod  

**Databases**
1.	Currently using dev->qa->onboard->prod

**SQL**
1.	Using parameterized sql with environment variables to automate deployment from dev -> qa -> onboard -> prod

**SharePoint List Storage structure prior to upload to Azure**  

1. NCIRD lists to maintain configuration data should be created in SharePoint at [GIFT SharePoint](todo reference SharePoint when approved )
2. The lists should be named ndsp_[system]_config_[table] where system is a 3 digit abbreviation of the system name and table is the entity you want to configure.  If the table applies to multiple system/project add a column name project_id to distinguish each project and use all as the system name.

**On Premise Storage Folder structure prior to upload to Azure**
1.  Do not store file on you local hard drive, store on project team site one drive
2.  Store in ndsp team site in a folder structure based on the template below

- Have a top level folder with project linked to teamsite
- have subdirectories for bronze input that will be uploaded to azure prefixed with
  - [project name]-[bronze-input]-[file-type]
  - example (ndsp-pertussis-bronze-input-csv)

TODO Insert image without senstive data


**Azure Storage Folder Structures  (don’t use – in folder names)**
1.	by project - ezdx (NCEZID), ndsp (NCIRD)
2.      by project area 
3.	by environment: dev, qa, onboard, prod
3.	by delta and in 
4.	for in In broken out by file type – csv, tsv, sas, etc
5.      for tables - by tables - then bronze, silver, gold

Example:

TODO Insert image without senstive data

**DataBricks Repositories**
1.  Name workspace project name-notebook
Example:  pertussis-notebooks

**ndsp-pertussis-bronze-input-csv**

1.	Top level folder by project
2.	Subdirectories by environment: dev, qa, onboard, prod
3.	Subdirectories bronze, common, silver and gold

**DataBricks Deployment**

1.	Top level folder by project
2.	Subdirectories by environment: dev, qa, onboard, prod
3.	Subdirectories bronze, common, silver and gold



**DataBricks Tables and Columns**

1.	 Prefixes

 We already had one meeting where I explained the methodogy of prefixing  tables and views with 
-	Bronze_[sys]
-	Silver
-	Gold

2.	Suffixes
Suffix objects based on type with either 
- _tbl for table
- _vw for view

3.	Columns
  - All columns in the bronzes tables are sorted in alphabetical order
  - Naming Conventions
  - Need to sort column names alphabetically
  - Use _ to represent space
  - Default to lower case, if legacy camel case naming is used for any reason and columns are named ID use suffix ID rather than Id
  - unique business id columns should be created for for all bronze tables and labeled row_id
  - Datatypes
Other datatypes are inferred but can be over written
Timestamps are inferred to timestamps
Dates are converted to dates can’t be inferred
Blanks default to nulls
Need to trim all strings with trim function


**Systems**

1.	Create a project id for each system, currently, ndsp_pertussis, ndsp_phlip and ndsp_ddt and (ndsp – shared)
There are lots of other components to documents, powerbi, logicapps, sharepoint, requirements, security, unit test, devops deployment, archive.



**Logic App List Synchronization**

1.  Logic apps should be stored in devops at [Logic App Repo](TODO referece repo when approved)
2.  The logic apps should following the naming conventions in the following example:
-for exporting a list that applies to multiple projects
ndsp-list-export-all-config-codes
-for export a list that applies to pertussis project
ndsp-list-export-prt-config-transmission-period
-for migrations lists that apply to multiple project from one SharePoint List to a different List
ndsp-list-migrate-all
3.  Logic apps should be created in Azure on the DDID-NCIRD-PRD-C1 subscription.  Name should match the repo name such as ndsp-list-export-all-config-codes
4.  Currently we are defaulting the logic apps to consumption based
5.  SharePoint List are currently configured to run off either a list change event or an email.

- **Important:**:  Some legacy logic apps are triggered by http endpoints which are publicly accessible.  We have mission critical email notifications that can currently be triggered by anyone located on any public network anywhere.  This is a huge security issue.  Do not create logic apps with http endpoints that have publicly accessible endpoints.

**Azure Data Factory (ADF) Scheduling**

1. Naming Conventions for triggers
- [project_name[-[report]-[schedule]
- example: ndsp_pertussis_reporting_standard_sundays

2. Repositories for ADF

- Ensure that all adf job and triggers are under source control, ideally though automated integration with devops


### Location

By default, you should use this to start a new project on CDC internal git server <https://git.cdc.gov>. Everyone in CDC has access to this when they are on network.

If you already have access, or anticipate people outside CDC needing to view or work on this code, use this to start a new project on CDC's private GitHub cloud, <https://github.com/cdcent>. [You can request access](https://forms.office.com/Pages/ResponsePage.aspx?id=aQjnnNtg_USr6NJ2cHf8j44WSiOI6uNOvdWse4I-C2NUQjVJVDlKS1c0SlhQSUxLNVBaOEZCNUczVS4u). This is in the cloud so you can get to it off network.

If you have special requirements, you can check out the [other locations](https://it-guides.cdc.gov/source-code/knownRepos/) (intranet only)    where you can use this template.

### Structure

These folders are meant to help organize and make it easier for others to understand and contribute.

```sh
├── R                   <- R scripts, delete if unnecessary
├── SAS                 <- SAS scripts, delete if unnecessary
├── analysis            <- analysis and visualization files (eg notebooks, tableau, Rmarkdown, etc )
│   └── template.Rmd    <- example template for Rmarkdown
├── data                <- data files used by project
│   ├── clean           <- processed files ready for analysis, try not to store these in the repo, make them
│   ├── meta            <- metadata needed for analysis
│   └── raw             <- raw files, original, immutable data dump
├── docs                <- documentation and references (codebooks, etc)
├── output              <- output files
├── python              <- Python scripts, delete if unnecessary
├── readme.md           <- Description of project, instructions for how to run
├── reports             <- Generated reports and visualizations
│   └── figures         <- Generated graphics used in reports
└── sql                 <- SQL scripts, delete if unnecessary
```

### References

* <https://github.com/lazappi/cookiecutter-r-analysis>
* <https://git.cdc.gov/oet5/premier_ehr>
* <https://git.biotech.cdc.gov/fya1/spock>
* <https://github.com/drivendata/cookiecutter-data-science>

## Housekeeping

This section contains info [useful for organization](https://github.com/cdcent/enterprise_practices).

* Point of contact: SRRG
* Organizational unit: EOC/SRRG
* Related projects: N/A
* Related investments: COVID-19 Response
* Governance status: Under design
* Program official: Brian Lee

The participants of this project are required to adhere to [our code of conduct](https://github.com/CDCgov/template/blob/master/code-of-conduct.md). Although the contents of this project are available under the [Apache Software License](https://github.com/cdcent/enterprise_practices/blob/master/LICENSE) distribution is restricted to only appropriate CDC staff due to cybersecurity regulations. Unless otherwise noted, all contributions to this project are accepted by the contributor as containing unlimited data usage rights by CDC and under the same license of the project.

## Public Domain Standard Notice
This repository constitutes a work of the United States Government and is not
subject to domestic copyright protection under 17 USC § 105. This repository is in
the public domain within the United States, and copyright and related rights in
the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
All contributions to this repository will be released under the CC0 dedication. By
submitting a pull request you are agreeing to comply with this waiver of
copyright interest.

## License Standard Notice
The repository utilizes code licensed under the terms of the Apache Software
License and therefore is licensed under ASL v2 or later.

This source code in this repository is free: you can redistribute it and/or modify it under
the terms of the Apache Software License version 2, or (at your option) any
later version.

This source code in this repository is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the Apache Software License for more details.

You should have received a copy of the Apache Software License along with this
program. If not, see http://www.apache.org/licenses/LICENSE-2.0.html

The source code forked from other open source projects will inherit its license.

## Privacy Standard Notice
This repository contains only non-sensitive, publicly available data and
information. All material and community participation is covered by the
[Disclaimer](https://github.com/CDCgov/template/blob/master/DISCLAIMER.md)
and [Code of Conduct](https://github.com/CDCgov/template/blob/master/code-of-conduct.md).
For more information about CDC's privacy policy, please visit [http://www.cdc.gov/other/privacy.html](https://www.cdc.gov/other/privacy.html).

## Contributing Standard Notice
Anyone is encouraged to contribute to the repository by [forking](https://help.github.com/articles/fork-a-repo)
and submitting a pull request. (If you are new to GitHub, you might start with a
[basic tutorial](https://help.github.com/articles/set-up-git).) By contributing
to this project, you grant a world-wide, royalty-free, perpetual, irrevocable,
non-exclusive, transferable license to all users under the terms of the
[Apache Software License v2](http://www.apache.org/licenses/LICENSE-2.0.html) or
later.

All comments, messages, pull requests, and other submissions received through
CDC including this GitHub page may be subject to applicable federal law, including but not limited to the Federal Records Act, and may be archived. Learn more at [http://www.cdc.gov/other/privacy.html](http://www.cdc.gov/other/privacy.html).

## Records Management Standard Notice
This repository is not a source of government records, but is a copy to increase
collaboration and collaborative potential. All government records will be
published through the [CDC web site](http://www.cdc.gov).

## Additional Standard Notices
Please refer to [CDC's Template Repository](https://github.com/CDCgov/template)
for more information about [contributing to this repository](https://github.com/CDCgov/template/blob/master/CONTRIBUTING.md),
[public domain notices and disclaimers](https://github.com/CDCgov/template/blob/master/DISCLAIMER.md),
and [code of conduct](https://github.com/CDCgov/template/blob/master/code-of-conduct.md).
