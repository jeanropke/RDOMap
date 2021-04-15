# Updates all language files from our Crowdin project.
# Requires a valid crowdin.ymt file to be present in the root.

cd ..
{
  git pull
  crowdin download -b RDO
  git add .
  git commit -m "Automatic language update."
  git push
  crowdin upload sources -b RDO
  crowdin upload translations -b RDO
} >"logs/lang-file-$(date +"%Y-%m-%d_%H-%M").log" 2>&1
