using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Magnet : MonoBehaviour {
	GameObject projectile;
	GameObject player;
	bool magnetOn = false;
	PlayerController pc;

	// Use this for initialization
	void Start () {
		projectile = gameObject;
		player = GameObject.FindWithTag ("Player");
		pc = player.GetComponent<PlayerController> ();
	}

	// Update is called once per frame
	void Update () {
		magnetOn = pc.isMagnetized;
		if (magnetOn == true) {
			Rigidbody2D rb = projectile.GetComponent<Rigidbody2D> ();

			Vector2 dir = player.transform.position - projectile.transform.position;
			float distance = Vector3.Distance (player.transform.position, projectile.transform.position);
			float magnetDistanceStr = (10f / distance) * 6f;

			rb.AddForce (magnetDistanceStr * dir,
				ForceMode2D.Force);
			transform.right = rb.velocity;
		}
	}
}
