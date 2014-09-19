SELECT countries.cartodb_id,
       countries.adm0_a3,
       countries.name,
       -- countries.the_geom,
       countries.the_geom_webmercator,
       export_generic_prod_%(table)s_dp.projectname AS project,
       export_generic_prod_%(table)s_dp.answerscore::float,
       export_generic_prod_%(table)s_dp.aspecttext,
       export_generic_prod_%(table)s_dp.answervalue AS value,
       export_generic_prod_%(table)s_meta.criteria AS answer

FROM countries

JOIN export_generic_prod_%(table)s_dp ON countries.adm0_a3=export_generic_prod_%(table)s_dp.targetdescription
JOIN export_generic_prod_%(table)s_meta ON(export_generic_prod_%(table)s_meta.aspectid=export_generic_prod_%(table)s_dp.aspectid
  AND export_generic_prod_%(table)s_dp.answervalue=export_generic_prod_%(table)s_meta.choice)

WHERE export_generic_prod_%(table)s_dp.aspectid='%(answer)s'
ORDER BY countries.adm0_a3 ASC
