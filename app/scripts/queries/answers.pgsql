SELECT
dnorm.targetid,
dnorm.targetname,
aspecttext,
dnorm.aspectid,
criterias.criterias,
--reviewanswervalue,
father,
fatherdescription,
fathers.datatype,
answerscore,
answervalue::text,
level,
answersourcedescription,
answercomments,
criterias.aspectname,
notedata1 || notedata2 as notes,
CASE
WHEN depth::text~E'^\\d+$'
THEN depth::integer
ELSE 0
END
as depth

FROM export_generic_prod_%(table)s_dp dnorm
left join export_generic_prod_%(table)s_notes notes
on
  dnorm.aspectid = notes.aspectid
  and dnorm.targetid = notes.targetid
left join

-- question+criterias SUB-select
(SELECT aspectid, aspectname,
(SELECT
array(SELECT a.choice ||'|'||a.criteria
      FROM export_generic_prod_%(table)s_meta a
      where a.aspectid = b.aspectid
      )) as criterias
FROM export_generic_prod_%(table)s_meta b
GROUP BY aspectid, criterias, aspectname
-- ORDER BY targetid

) as criterias
on
dnorm.aspectid = criterias.aspectid
left join

-- question+father SUB-select
(SELECT aspectid, datatype,
(SELECT aspectid as fatherid FROM export_generic_prod_%(table)s_meta a WHERE b.aspectid = ANY(regexp_split_to_array(memberaspects, '[|]')) ) as father,
(SELECT aspectdescription as fatherdescription FROM export_generic_prod_%(table)s_meta a WHERE b.aspectid = ANY(regexp_split_to_array(memberaspects, '[|]')) ) as fatherdescription
FROM export_generic_prod_%(table)s_meta b GROUP BY father, b.aspectid, b.datatype) as fathers
on dnorm.aspectid=fathers.aspectid

where answervalue::text is not null
AND answervalue::text <>''

%(targets)s
%(questions)s

GROUP BY dnorm.targetid,
dnorm.targetname,
aspecttext,
dnorm.aspectid,
criterias.criterias,
--reviewanswervalue,
father,
fatherdescription,
fathers.datatype,
answerscore,
answervalue,
level,
depth,
answersourcedescription,
answercomments,
criterias.aspectname,
notes

order by
CASE
WHEN depth::text~E'^\\d+$'
THEN depth::integer
ELSE 0
END ASC, father asc,aspectid asc
