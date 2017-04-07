using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class RockDestroy : MonoBehaviour {
	Rigidbody2D obj;
	//ParticleSystem particles;
	// Use this for initialization
	void Start () {
		obj = GetComponent<Rigidbody2D> ();
		//particles = GetComponent<ParticleSystem> ();
	}
	void OnTriggerEnter2D(Collider2D c){
		Destroy (gameObject);
	}
	// Update is called once per frame
	void Update () {
		Vector2 position = obj.position;
		if (position.x > 6.5 || position.x < -6.5 ||
		   position.y > 10.75 || position.y < -10.75) {
			Destroy (gameObject);
		}
	}
}
