import { Component, OnInit } from '@angular/core';
import { AnnotationType } from '../annotationUtil';
interface IAnnotation {
  targetText: string;
  node: HTMLSpanElement;
  targetNodeParentToChild?: number[];
  backgroundColor?: string;
  offset?: {
    startOffset: number;
    endOffset: number;
  };
  metaData: {
    type: string;
    date: string;
    showReplyInput: boolean;
    // data: {
    //   firstPart: string;
    //   middlePart: string;
    //   lastPart: string;
    // };
    replies: {
      message: string;
      author: string;
      repliedOn: string;
      isEditOpen: boolean;
      cloneMessage: string;
    }[];
  };
}

@Component({
  selector: 'app-c-pdf-viewer',
  templateUrl: './c-pdf-viewer.component.html',
  styleUrls: ['./c-pdf-viewer.component.css'],
})
export class CPdfViewerComponent implements OnInit {
  blackColor = 'rgba(0,0,0,1)';
  pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  // pdfSrc =
  //   'https://user.iiasa.ac.at/~gruebler/Lectures/Leoben00-01/ch2%20from%20book.pdf';

  // pdfSrc =
  //   'https://a207958-cf-pas-live-publicationassembly-execution-qa-use1.s3.amazonaws.com/f8963d8d-8349-4f00-9a52-a8459297d299/CET_BR_D2021-07-26_0053_1.pdf?response-content-disposition=inline&response-content-type=application%2Fpdf&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAWZWAOWAASTP34HUW%2F20220308%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220308T111652Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFQaCXVzLWVhc3QtMSJGMEQCIDdGvh7vnAjV%2FoePFlxRW7JJm4J9yjY0rlN7uEn1Of1QAiAOR7vDuh%2FWM0zkT787r2lXOeN6WNciv1pAxuUqbt9YRyq2Agi8%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDQ2NzQ4MTMwOTE4NSIMieHVt8pV%2FVteV9huKooCCpbvxvnJ6n%2FYGeWTD5g4aG1lLquZH2llobKVzDU9lbKG9L8pZ1pLQD7hmXTBY%2FrNQWi5opKEnMzuVGufLAirl%2BHq%2B66kByV4JqLjKQ7ufELp9tLWgMiJsOrMBimBqi3VyMQXJSkwwcYl6ARvOD4uIRKrqmdCF730mHPf7sKNTikzC1iZARutcJDEPwnHeeFs%2B9cJiLYN%2BuhDH53BKLr73AWZVE%2FgHJLFMx8x0Gt025qm0vpDsZgzv3xDge2DkzRyuVsrY4Pqje7fGVejWlUJTcxnkJonLj6mSUHpb1UWhw1eMRjxrSWFa4pyFN6tmKL4RsVdxYwrDkSAdVVV2c0hAk5I3tiSFvwi8I8woPackQY6mwEvZTZbZvXspAorekM3Qsg4x4uCql42%2B6ZQlEslkHLWVsbulhds9hMsROkpEEsLpac3f%2BGzhyvn%2FjUvzE1gRywkU9%2BSnCwgzSGA3NbPx02MIMZkWMKGfVBCxhxf661R4VfrCWAyJwRSJEZukHuE7RqlZPMBT%2BgGna8kjJr3DrgDEEWX%2FcMiB8TS2IJX5DAIMe6fBWPZeccq7dWSIw%3D%3D&X-Amz-Signature=ac863838ecebfc7259f33a2ec38bc19d49fb3e4fa85322db45097c04b3c77390';
  zoom = 0.75;
  color = 'rgba(255, 255, 0, 1)';
  date = 'Date';
  annotations: IAnnotation[] = [];
  username = 'Suprabh';
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  replyText = '';
  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.modifyTextLayerStyles();
    }, 1000);
    if (JSON.parse(localStorage.getItem('annotations')!)) {
      setTimeout(() => {
        this.annotations = JSON.parse(localStorage.getItem('annotations')!);
        this.annotations.forEach((annotation: IAnnotation, index: number) => {
          const node = this.getNode(annotation.targetNodeParentToChild!);
          annotation.node = node;
          const { firstPart, secondPart, thirdPart } =
            this.extractDataFromAnnotation(annotation);
          annotation.node.innerHTML = '';

          annotation.node.append(firstPart);
          const span = document.createElement('span');
          span.innerText = secondPart;
          if (
            annotation.metaData.type === AnnotationType.highlight ||
            annotation.metaData.type === AnnotationType.text
          ) {
            span.style.background = annotation.backgroundColor!;
            span.style.position = 'static';
          } else if (annotation.metaData.type === AnnotationType.underline) {
            span.style.borderBottom = `0.2rem solid ${annotation.backgroundColor}`;
            span.style.position = 'static';
          } else {
            span.style.borderBottom = `0.2rem solid ${annotation.backgroundColor}`;
            span.style.transform = 'translateY(-50%)';
          }

          annotation.node.append(span);
          annotation.node.append(thirdPart);
        });
      }, 1000);
    }
  }

  modifyTextLayerStyles() {
    let textLayers: any = document.getElementsByClassName('textLayer');
    textLayers = Array.prototype.slice.call(textLayers);
    for (let layer of textLayers) {
      layer.style.opacity = 0.5;
    }
  }

  getNode(nodePath: number[]) {
    let parent: any = document.querySelector('body');

    nodePath.forEach((item: number) => {
      parent = parent?.children[item];
    });
    return parent;
  }

  highlightSelection() {
    const userSelection: any = window.getSelection();
    //Attempting to highlight multiple selections (for multiple nodes only + Currently removes the formatting)
    const range = userSelection.getRangeAt(0);
    const targetNode = userSelection.anchorNode.parentElement;
    const node = this.highlightRange(range, targetNode);

    range.deleteContents();
    range.insertNode(node);
  }

  highlightRange(range: any, targetNode: any) {
    //Create the new Node
    const newNode = document.createElement('span');

    // Make it highlight
    newNode.setAttribute('style', `background-color: ${this.color};`);

    //Add Text for replacement (for multiple nodes only)
    //newNode.innerHTML += range;
    newNode.appendChild(range.cloneContents());

    //Apply Node around selection (used for individual nodes only)
    //range.surroundContents(newNode);
    const parentToChild = this.getPath(targetNode);
    const targetText = newNode.innerText;
    const nodeData = {
      targetNodeParentToChild: parentToChild,
      node: newNode,
      offset: { startOffset: range.startOffset, endOffset: range.endOffset },
      backgroundColor: this.color,
      targetText,
      metaData: {
        type: AnnotationType.highlight,
        date: this.getDate(),
        replies: [],
        showReplyInput: false,
      },
    };
    this.annotations.push(nodeData);
    return newNode;
  }

  saveToStorage() {
    localStorage.setItem('annotations', JSON.stringify(this.annotations));
  }

  clearStorage() {
    this.annotations = [];
    localStorage.removeItem('annotations');
    window.location.href = window.location.href;
  }

  getDate() {
    const date = new Date();
    const time = this.formatAMPM(date);
    const month = this.monthNames[date.getMonth()];
    return `${time} ${month} ${date.getDate()}, ${date.getFullYear()}`;
  }

  formatAMPM(date: any) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  deletenode(node: any) {
    const contents = document.createTextNode(node.innerText);
    node.parentNode.replaceChild(contents, node);
  }

  removeNode(index: number) {
    this.deletenode(this.annotations[index].node);
    this.annotations.splice(index, 1);
  }

  replyBtn(index: number) {
    // add the text area with button and cancel action.
    this.annotations[index].metaData['showReplyInput'] = true;
  }

  cancelReply(index: number) {
    this.annotations[index].metaData['showReplyInput'] = false;
    this.replyText = '';
  }

  addReply(index: number) {
    this.annotations[index].metaData['showReplyInput'] = false;
    const replies = this.annotations[index].metaData['replies'];
    const message = this.replyText;

    if (replies && Array.isArray(replies) && replies.length > 0) {
      this.annotations[index].metaData['replies'].push({
        message,
        author: this.username,
        repliedOn: this.getDate(),
        isEditOpen: false,
        cloneMessage: message,
      });
    } else {
      this.annotations[index].metaData['replies'] = [
        {
          message,
          author: this.username,
          repliedOn: this.getDate(),
          isEditOpen: false,
          cloneMessage: message,
        },
      ];
    }
    this.replyText = '';
  }
  handleReplyChange(value: string) {
    this.replyText = value;
  }

  editReply(replyIndex: number, annotationIndex: number) {
    console.log(replyIndex);
    console.log(annotationIndex);
    this.annotations[annotationIndex].metaData.replies[replyIndex].isEditOpen =
      true;
  }

  deleteReply(replyIndex: number, annotationIndex: number) {
    this.annotations[annotationIndex].metaData.replies.splice(replyIndex, 1);
  }

  cancelReplyEdit(replyIndex: number, annotationIndex: number) {
    this.annotations[annotationIndex].metaData.replies[replyIndex].isEditOpen =
      false;

    this.annotations[annotationIndex].metaData.replies[
      replyIndex
    ].cloneMessage =
      this.annotations[annotationIndex].metaData.replies[replyIndex].message;
  }

  updateReply(replyIndex: number, annotationIndex: number) {
    this.annotations[annotationIndex].metaData.replies[replyIndex].isEditOpen =
      false;
    this.annotations[annotationIndex].metaData.replies[replyIndex].message =
      this.annotations[annotationIndex].metaData.replies[
        replyIndex
      ].cloneMessage;
  }

  handleReplyEdit(
    changeValue: string,
    replyIndex: number,
    annotationIndex: number
  ) {
    this.annotations[annotationIndex].metaData.replies[
      replyIndex
    ].cloneMessage = changeValue;
  }

  annotateSelection(annotationType: number) {
    const userSelection: any = window.getSelection();
    const range = userSelection.getRangeAt(0);
    const targetNode = userSelection.anchorNode.parentElement;
    const node = this.annotateRange(range, targetNode, annotationType);

    range.deleteContents();
    range.insertNode(node);
  }

  annotateRange(range: Range, targetNode: any, type: number) {
    const newNode = document.createElement('span');
    let showComment: boolean = false;
    let annotationType: string = '';

    if (type == 1) {
      this.color = this.blackColor;
      annotationType = AnnotationType.underline;
      newNode.setAttribute(
        'style',
        `border-bottom: 0.2rem solid ${this.color} !important;`
      );
    } else if (type == 2) {
      this.color = this.blackColor;
      annotationType = AnnotationType.strikeThrough;
      newNode.style.borderBottom = `0.2rem solid ${this.color}`;
      newNode.style.transform = 'translateY(-50%)';
    } else if (type == 3) {
      annotationType = AnnotationType.text;
      showComment = true;
      newNode.setAttribute('style', `background-color: ${this.color};`);
    }

    newNode.appendChild(range.cloneContents());
    const parentToChild = this.getPath(targetNode);
    const targetText = newNode.innerText;
    const nodeData = {
      targetNodeParentToChild: parentToChild,
      offset: { startOffset: range.startOffset, endOffset: range.endOffset },
      node: newNode,
      backgroundColor: this.color,
      targetText,
      metaData: {
        type: annotationType,
        date: this.getDate(),
        replies: [],
        showReplyInput: showComment,
      },
    };
    this.annotations.push(nodeData);
    return newNode;
  }

  getPath(currentNode: any) {
    const root = document.querySelector('body');

    // Getting the node element

    // Function to getPath
    function getPath(root: any, node: any) {
      // receiving a root element and a node element
      const path = []; // To save the path of the node element that need to get to the root element

      // Starting to get the path from bottom (nodeA) to top (rootA)
      while (node !== root) {
        // Because we are going to start from the node element to the top then we need to know wich is the parent element of the node
        const parent = node.parentElement; // getting the parent element of the node element

        const childrens = Array.from(parent.children); // Getting the childrens of the actual parent node in an Array (not in a HTMLCollection)

        const nodeIndex = childrens.indexOf(node); // Check if the actual node is in the childrens array, if yes - then get the position where the node element was founded

        path.push(nodeIndex); // Saving the position that the node element was founded into the path array

        node = parent; // Now we're moving up so now the current node will be the parent node...and the process will be repeated
      }

      return path;
    }

    // Executing the function
    const path = getPath(root, currentNode);

    // Printing final path in the browser
    console.log('path ---->', path);
    console.log(`Reversing the path from top to bottom - ${path.reverse()}`);
    return path;
  }

  scrollIntoView(annotationId: number) {
    this.annotations[annotationId].node.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  getBadgeStyle(annotationType: string) {
    if (annotationType === 'Highlight') {
      return 'highlight-btn';
    } else if (annotationType === 'Text') {
      return 'annotate-btn';
    } else if (annotationType === 'Underline') {
      return 'underline-btn';
    } else {
      return 'strikethrough-btn';
    }
  }

  extractDataFromAnnotation(annotation: IAnnotation) {
    const firstPart = annotation.node.innerText.slice(
      0,
      annotation.offset!.startOffset
    );
    const thirdPart = annotation.node.innerText.slice(
      annotation.offset!.endOffset,
      annotation.node.innerText.length
    );
    const secondPart = annotation.node.innerText.slice(
      annotation.offset!.startOffset,
      annotation.offset!.endOffset
    );
    return { firstPart, secondPart, thirdPart };
  }
}
