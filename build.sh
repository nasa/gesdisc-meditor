set -ex

REGISTRY=dev.gesdisc.eosdis.nasa.gov:443
BASEDIR=$(dirname "$0")

# temporary hack to get this private repo installing correctly
cd ./ui
npm install
cd ..

# update visible UI version
version=`cat VERSION`
echo "export const version = '$version'" > './ui/src/environments/version.ts'

# build images
docker image build -t $REGISTRY/meditor_ui ./ui --no-cache
docker image build -t $REGISTRY/meditor_server ./nodejs-server-server --no-cache
docker image build -t $REGISTRY/meditor_proxy ./proxy --no-cache
docker image build -t $REGISTRY/meditor_notifier ./notifier --no-cache
docker image build -t $REGISTRY/meditor_replicaset ./mongo-replicaset --no-cache