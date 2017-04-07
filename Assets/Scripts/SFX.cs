using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SFX : MonoBehaviour {
	private static SFX instance = null;
	public static SFX Instance {
		get { return instance; }
	}
	void Awake() {
		if (instance != null && instance != this) {
			Destroy(this.gameObject);
			return;
		} 
		else {
			instance = this;
		}
		DontDestroyOnLoad(this.gameObject);
	}
}
