declare module 'react-player' {
  import { Component } from 'react';

  interface ReactPlayerProps {
    url: string;
    width?: string | number;
    height?: string | number;
    controls?: boolean;
    config?: {
      youtube?: {
        playerVars?: {
          [key: string]: any;
        };
      };
    };
  }

  export default class ReactPlayer extends Component<ReactPlayerProps> {}
} 