package com.rnvideochat;
import android.content.Intent;
import android.os.Bundle;
import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    Intent intent = new Intent(this, AppMainActivity.class);
    startActivity(intent);
    finish();
  }
    
}
