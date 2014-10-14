SELECT

  DISTINCT(export_generic_prod_23_dp.aspectid) AS id,
  aspecttext AS name,
  projectname AS title,
  aspectname,

CASE

WHEN export_generic_prod_23_dp.depth::text~E'^\\d+$'
THEN export_generic_prod_23_dp.depth::integer
ELSE 0
END

as depth

FROM export_generic_prod_23_dp
JOIN export_generic_prod_23_meta
on export_generic_prod_23_dp.aspectid=export_generic_prod_23_meta.aspectid
WHERE answervalue is not null
AND answervalue <>''
ORDER BY

CASE
WHEN export_generic_prod_23_dp.depth::text~E'^\\d+$'
THEN export_generic_prod_23_dp.depth::integer
ELSE 0
END

ASC, export_generic_prod_23_dp.aspectid ASC
