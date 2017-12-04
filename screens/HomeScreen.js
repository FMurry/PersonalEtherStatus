import React from 'react';
import {
  AsyncStorage,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl
} from 'react-native';
import { WebBrowser } from 'expo';

import { MonoText } from '../components/StyledText';

import CryptoJS from 'crypto-js';

import { WALLET_ID, WALLET_ADDR, COINBASE_SECRET} from '../constants/Secret';


export default class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      amount: null,
      currentHash: null,
      address: null,
      loading: true,
      refreshing: false,
      walletId: WALLET_ID,
      balance: null
    };
    
    this.getWalletAmount = this.getWalletAmount.bind(this);
    this.getCurrentHashRate = this.getCurrentHashRate.bind(this);
    this.getCoinBaseInfo = this.getCoinBaseInfo.bind(this);

  }

  componentWillMount() {
    AsyncStorage.getItem('@Wallet')
      .then(value => {
        if(value){
          this.setState({
            address: value
          }, () => {
            this.getWalletAmount();
          })
        }
        else {
          AsyncStorage.setItem('@Wallet',WALLET_ADDR)
          .then((value) => {
            this.setState({
              address: value
            }, () => {
              this.getWalletAmount();
            });
          })
          .catch(err => {
            console.log(err);
          })
        }
      })
      .catch(err => {
        console.log(err);
      })
    console.log('Home Will Mount');
  }

 _onRefresh() {
    console.log('Refreshing');
    this.setState({refreshing: true})
    this.getWalletAmount();
  }

  getWalletAmount() {
    const walletAmountUri = `https://api.nanopool.org/v1/eth/balance/${this.state.address}`;
    console.log('Fetching wallet with address: '+this.state.address);
    fetch(walletAmountUri)
      .then(response => response.json())
      .then((responseJson) => {
        console.log('Current Mined Response:',responseJson);
        this.setState({
          amount: responseJson.data
        });
        this.getCurrentHashRate();
      })
      .catch(err => {
        console.log(err);
      });

  }

  getCurrentHashRate() {
    const currentHashUri = `https://api.nanopool.org/v1/eth/hashrate/${this.state.address}`;
    console.log('Fetching HashRate');
    fetch(currentHashUri)
      .then(response => response.json())
      .then((responseJson) => {
        console.log('Current Hashrate Response:',responseJson);
        this.setState({
          currentHash: responseJson.data,
          
        });
        this.getCoinBaseInfo();
      })
      .catch(err => {
        console.log(err);
      })
  }

  getCoinBaseInfo() {
    const accountUri = `https://api.coinbase.com/v2/accounts/${this.state.walletId}`;
    const CB_ACCESS_KEY = 'lXDTNms4UhJ6hjy7';
    const CB_ACCESS_TIMESTAMP = Math.round((new Date()).getTime() / 1000);
    const value = CB_ACCESS_TIMESTAMP+'GET'+'/v2/accounts/'+this.state.walletId;
    const CB_ACCESS_SIGN = CryptoJS.HmacSHA256(value,COINBASE_SECRET).toString();
    console.log('Value:',value);
    var headers = new Headers();
    headers.append('CB-ACCESS-KEY',CB_ACCESS_KEY);
    headers.append('CB-ACCESS-TIMESTAMP',CB_ACCESS_TIMESTAMP);
    headers.append('CB-ACCESS-SIGN',CB_ACCESS_SIGN);
    fetch(accountUri,{method: 'GET', headers: headers})
      .then(response => response.json())
      .then(responseJson => {
          console.log("Coinbase Response: ",responseJson);
          this.setState({
            balance: responseJson.data.balance.amount,
            loading: false,
            refreshing: false
          });
      })
      .catch(err => {
        console.log(err);
      })
  }

  render() {
    var info = <View><Text style={styles.getStartedText}>
              Current Mined: {this.state.amount}
            </Text>
            <Text style={styles.getStartedText}>
              Current Hashrate: {this.state.currentHash+' H/s'}
            </Text>
            <Text style={styles.getStartedText}>
              Current Balance: {this.state.balance}
            </Text></View>;
    var loadText = <Text style={styles.getStartedText}>Loading</Text>
    var refreshControl = <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} refreshControl={refreshControl}>
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require('../assets/images/ethereum.png')
                  : require('../assets/images/ethereum.png')
              }
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.getStartedContainer}>
            <Text>
            {'This app currently uses address: '+this.state.address}
            </Text>

            {this.state.loading || this.state.refreshing ? loadText : info}
          </View>

        </ScrollView>

        
      </View>
    );
  }

  _maybeRenderDevelopmentModeWarning() {
    if (__DEV__) {
      const learnMoreButton = (
        <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
          Learn more
        </Text>
      );

      return (
        <Text style={styles.developmentModeText}>
          Development mode is enabled, your app will be slower but you can use useful development
          tools. {learnMoreButton}
        </Text>
      );
    } else {
      return (
        <Text style={styles.developmentModeText}>
          You are not in development mode, your app will run at full speed.
        </Text>
      );
    }
  }

  
  _handleHelpPress = () => {
    WebBrowser.openBrowserAsync(
      'https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes'
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    marginTop: 18,
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
