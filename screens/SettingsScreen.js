import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import {
	AsyncStorage,
	View,
	Text,
	TextInput,
	Button,
	StyleSheet
} from 'react-native';
export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
  };

  constructor(props){
  	super(props);
  	this.state= {
  		wallet: '',
  		buttonText: 'Change Wallet'
  	};

  	this.onClick = this.onClick.bind(this);
  }

  onClick() {
  	console.log('Setting Wallet to '+this.state.wallet);
  	AsyncStorage.setItem('@Wallet',this.state.wallet)
  	.then(() => {
  		this.setState({
  			buttonText: 'Wallet Changed'
  		});
  	})
  	.catch(err => {
  		console.log(err);
  	})
  };

  onReset() {
  	console.log('Resetting Wallet');
  	AsyncStorage.setItem('@Wallet', '0xd4b1be58214dbA18eB9d9328f9AfF52e539B4933');
  }

  render() {
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config */
    return (
    	<View style={styles.container}>
    		<TextInput style={styles.textInput} placeholder="Enter Wallet Address"
    		onChangeText={(wallet) => this.setState({wallet: wallet, buttonText: 'Change Wallet'})}
    		autoCorrect={false} />
    		<Button style={styles.button}onPress={this.onClick} title={this.state.buttonText} accessibilityLabel="Click here to change wallet"/>
    		<Button style={styles.button} onPress={this.onReset} title="Restore to Default" accessibilityLabel="Click to Restore default Settings"/>
    	</View>
    );
  }
}

const styles = StyleSheet.create({
	container: {
    	flex: 1,
    	backgroundColor: '#fff',
  	},
  	textInput: {
  		height: 120,
  		textAlign: 'center',
  		width: '100%',
  		marginBottom: '10%'
  	},
  	button: {
  		marginBottom: 100
  	}
});
