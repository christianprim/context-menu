BEGIN{NR<10; FS="[{|}]"}
/^\\def\\PTyp/{p=$2}
/^\\def\\Klasse/{k=$2}
/^\\def\\PDatum/{print p, k, $2}