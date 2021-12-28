# COVID Analysis Template

This project is made to help CDC responders start, work with others, produce useful analyses, and hand off to other responders.

## Getting Started

1. Create a new project using this template, <https://github.com/cdcent/covid_analysis_template/generate>. For public projects, put them in CDCgov; for private and inner, put then in CDCent.
1. Keep what helps you, ignore and delete the parts that don't help you.
1. Add access for other users (optional)
1. Do your work

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
