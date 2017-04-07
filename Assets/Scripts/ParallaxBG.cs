using System.Collections;
using System.Collections.Generic;
using UnityEngine;
public class ParallaxBG : MonoBehaviour {
	public GameObject background;
	public Vector3 pos;
	void Update () {
		pos = transform.position;
		pos.x = -(pos.x/5.1f);
		pos.y = -(pos.y/10.1f);
		pos.z = 10;
		background.transform.position = pos;
	}
}
