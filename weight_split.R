library(tidyverse)
library(jsonlite)
load("data/mobility_general.rda")
load("data/travel_data.rda")

df_travel_avg = df_travel %>%
                mutate(Other = ifelse(rowSums(.[5:12])==0, 1, 0)) %>%
                mutate(sum = rowSums(.[5:13])) %>%
                mutate(avgwt = allwt/sum) %>%
                .[c(1, 5:13, 15)] %>%
                gather(key = 'Mode', value = "Number", -c(1, 11))

df_general_avg = df_travel_avg %>% merge(df_general, by="UniqueID", all=TRUE) %>% select(-c('allwt', 'travel_code', 'Description')) %>% filter(Number > 0)

write_json( df_general_avg, 'data/mobility_general.json')
