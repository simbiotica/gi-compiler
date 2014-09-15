SELECT
targetid,
targetname,
aspecttext,
dnorm.aspectid,
criterias.criterias,
--reviewanswervalue,
father,
fatherdescription,
answerscore,
answervalue
FROM export_generic_prod_%(table)s_dp dnorm,

-- question+criterias SUB-select
(SELECT aspectid,
(SELECT
array(SELECT a.choice ||'|'||a.criteria
      FROM export_generic_prod_%(table)s_meta a
      where a.aspectid = b.aspectid
      )) as criterias
FROM export_generic_prod_%(table)s_meta b
GROUP BY aspectid, criterias
-- ORDER BY targetid
) criterias,

-- question+father SUB-select
(SELECT aspectid,
(SELECT aspectid as fatherid FROM export_generic_prod_%(table)s_meta a WHERE b.aspectid = ANY(regexp_split_to_array(memberaspects, '[|]')) ) as father,
(SELECT aspectdescription as fatherdescription FROM export_generic_prod_%(table)s_meta a WHERE b.aspectid = ANY(regexp_split_to_array(memberaspects, '[|]')) ) as fatherdescription
FROM export_generic_prod_%(table)s_meta b GROUP BY father, b.aspectid) fathers

where dnorm.aspectid = criterias.aspectid
AND dnorm.aspectid=fathers.aspectid
-- AND targetid IN (%(targets)s)
-- AND criterias.aspectid IN ('Q72','Q102', 'C32')

GROUP BY targetid,
targetname,
aspecttext,
dnorm.aspectid,
criterias.criterias,
--reviewanswervalue,
father,
fatherdescription,
answerscore,
answervalue

order by father asc,aspectid asc
