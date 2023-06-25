import json
import numpy as np
from sklearn.decomposition import PCA

import functions_framework
@functions_framework.http
def dim_reduce(request):
    vec_list = []
    try:    
        data = request.get_data()
        vec_dict = json.loads(data)
        vec_list = vec_dict["data"]
    except Exception as e:
        print(f"exception: {e}")
        response = {
        "statusCode": 500,
        "body": f"ERROR: {e}"
        }
        return response
    print(vec_list)
    X = np.array(vec_list)
    pca = PCA(n_components=3) # 3D projection
    X_reduced = pca.fit_transform(X)
    
    X_reduced_list = X_reduced.tolist()
    print(X_reduced_list)
    response = {
        "statusCode": 200,
        "body": json.dumps(X_reduced_list)
    }
    return response
