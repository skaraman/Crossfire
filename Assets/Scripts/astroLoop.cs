using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class astroLoop : MonoBehaviour {
	public Animator anim;
	// Use this for initialization
	void Start () {
		anim = GetComponent<Animator> ();
		anim.SetBool("started", true);
	}
}
