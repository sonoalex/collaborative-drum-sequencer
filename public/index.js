const $ = require( "jquery" );
window.jQuery = $;
window.$ = $;
require('jquery-knob');
require('webpd');
require('socket.io');
import AudioLoader from './js/utils/audiolib';
import GridRenderer from './js/ui/gridRenderer';
import Metronome from './js/metronome';
import Sequencer from './js/sequencer';
import DAW from './js/Daw';

// Import CSS
import "./css/style.css";
