import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AnnotationType } from '../annotationUtil';
interface IAnnotation {
  targetText: string;
  node: HTMLSpanElement;
  targetNodeParentToChild?: number[][];
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
  constructor(private router: ActivatedRoute) {}

  ngOnInit(): void {
    this.router.queryParams.subscribe((params: Params) => {
      this.pdfSrc = params['pdfURL'] || this.pdfSrc;
    });

    setTimeout(() => {
      this.modifyTextLayerStyles();
    }, 1000);
    if (JSON.parse(localStorage.getItem('annotations')!)) {
      setTimeout(() => {
        this.annotations = JSON.parse(localStorage.getItem('annotations')!);
        this.annotations.forEach((annotation: IAnnotation, index: number) => {
          const isMultiLine =
            annotation.targetNodeParentToChild!.length > 1 ? true : false;
          annotation.targetNodeParentToChild!.forEach(
            (nodesPath, selectionLineindex) => {
              const node = this.getNode(nodesPath);
              annotation.node = node;
              const { firstPart, secondPart, thirdPart } =
                this.extractDataFromAnnotation(
                  annotation,
                  selectionLineindex,
                  isMultiLine,
                  annotation.targetNodeParentToChild!.length
                );
              if (annotation.node) {
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
                } else if (
                  annotation.metaData.type === AnnotationType.underline
                ) {
                  span.style.borderBottom = `0.2rem solid ${annotation.backgroundColor}`;
                  span.style.position = 'static';
                } else {
                  span.style.borderBottom = `0.2rem solid ${annotation.backgroundColor}`;
                  span.style.transform = 'translateY(-50%)';
                }

                annotation.node.append(span);
                annotation.node.append(thirdPart);
              }
            }
          );
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
    const endNode = userSelection.focusNode.parentElement;
    this.highlightRange(range, targetNode, endNode);
    userSelection.removeAllRanges();
  }

  updateStyesOfSelected(
    range: any,
    targetNode: any,
    endNode: any,
    annotationType: string
  ) {
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    if (targetNode === endNode) {
      const first = targetNode.innerText.slice(0, startOffset);
      const second = targetNode.innerText.slice(startOffset, endOffset);
      const third = targetNode.innerText.slice(
        endOffset,
        targetNode.innerText.length
      );

      this.formatNodeWithContent(
        targetNode,
        { first, second, third },
        annotationType
      );
    } else {
      const middleNodes = this.getInBetweenNodes(targetNode, endNode).map(
        (path: number[]) => {
          return this.getNode(path);
        }
      );
      const nodes = [targetNode, ...middleNodes, endNode];
      const numberOfNodes = nodes.length;
      nodes.forEach((node, nodeIndex) => {
        if (nodeIndex === 0) {
          const first = node.innerText.slice(0, startOffset);
          const second = node.innerText.slice(
            startOffset,
            node.innerText.length
          );
          const third = '';
          this.formatNodeWithContent(
            node,
            { first, second, third },
            annotationType
          );
        } else if (nodeIndex === numberOfNodes - 1) {
          const first = '';
          const second = node.innerText.slice(0, endOffset);
          const third = node.innerText.slice(endOffset, node.innerText.length);

          this.formatNodeWithContent(
            node,
            { first, second, third },
            annotationType
          );
        } else {
          const first = '';
          const second = node.innerText.slice(0, node.innerText.length);
          const third = '';

          this.formatNodeWithContent(
            node,
            { first, second, third },
            annotationType
          );
        }
      });
    }
  }

  formatNodeWithContent(
    node: any,
    { first, second, third }: { first: string; second: string; third: string },
    annotationType: string
  ) {
    node.innerText = '';
    node.append(first);
    const span = document.createElement('span');
    span.innerText = second;
    if (annotationType === 'Highlight' || annotationType === 'Text') {
      span.style.backgroundColor = this.color;
    } else if (annotationType === 'Underline') {
      span.style.borderBottom = `0.2rem solid ${this.color}`;
    } else if (annotationType === 'Strikeout') {
      span.style.borderBottom = `0.2rem solid ${this.color}`;
      span.style.transform = 'translateY(-50%)';
    }

    node.append(span);
    node.append(third);
  }

  highlightRange(range: any, targetNode: any, endNode: any) {
    const newNode = document.createElement('span');

    newNode.appendChild(range.cloneContents());

    const parentToChild = this.getPath(targetNode);
    const parentToChildEndNode = this.getPath(endNode);
    const middleNodes = this.getInBetweenNodes(targetNode, endNode);

    const nodes =
      parentToChild.toString() === parentToChildEndNode.toString()
        ? [parentToChild]
        : [parentToChild, ...middleNodes, parentToChildEndNode];
    const targetText = newNode.innerText;
    const nodeData = {
      targetNodeParentToChild: nodes,
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
    this.updateStyesOfSelected(range, targetNode, endNode, 'Highlight');
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
    const endNode = userSelection.focusNode.parentElement;
    this.annotateRange(range, targetNode, annotationType, endNode);
    userSelection.removeAllRanges();
  }

  annotateRange(range: Range, targetNode: any, type: number, endNode: any) {
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
    const pathToLast = this.getPath(endNode);
    const middleNodes = this.getInBetweenNodes(targetNode, endNode);
    const nodes =
      targetNode === endNode
        ? [parentToChild]
        : [parentToChild, ...middleNodes, pathToLast];
    const targetText = newNode.innerText;

    const nodeData = {
      targetNodeParentToChild: nodes,
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
    this.updateStyesOfSelected(range, targetNode, endNode, annotationType);
  }

  getInBetweenNodes(targetNode: any, endNode: any) {
    const middleNodes = [];
    let current = targetNode.nextSibling;
    while (current && current !== endNode) {
      // current = current.nextSibling;
      if (current.nodeName == 'SPAN') {
        const path = this.getPath(current);
        middleNodes.push(path);
      }
      current = current.nextSibling;
    }
    return middleNodes;
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

    const path = getPath(root, currentNode);
    path.reverse();
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

  extractDataFromAnnotation(
    annotation: IAnnotation,
    selectionLineIndex: number,
    isMultiLine: boolean,
    numberOfLine: number
  ) {
    const def: any = {
      firstPart: '',
      secondPart: '',
      thirdPart: '',
    };
    if (!annotation.node) {
      return def;
    }
    if (isMultiLine && selectionLineIndex === 0) {
      const firstPart = annotation.node.innerText.slice(
        0,
        annotation.offset!.startOffset
      );
      const secondPart = annotation.node.innerText.slice(
        annotation.offset!.startOffset,
        annotation.node.innerText.length
      );
      const thirdPart = '';
      return {
        firstPart,
        secondPart,
        thirdPart,
      };
    } else if (isMultiLine && selectionLineIndex === numberOfLine - 1) {
      const firstPart = '';
      const secondPart = annotation.node.innerText.slice(
        0,
        annotation.offset!.endOffset
      );
      const thirdPart = annotation.node.innerText.slice(
        annotation.offset!.endOffset,
        annotation.node.innerText.length
      );

      return { firstPart, secondPart, thirdPart };
    } else if (numberOfLine === 1) {
      const firstPart = annotation.node.innerText.slice(
        0,
        annotation.offset!.startOffset
      );
      const secondPart = annotation.node.innerText.slice(
        annotation.offset!.startOffset,
        annotation.offset!.endOffset
      );
      const thirdPart = annotation.node.innerText.slice(
        annotation.offset!.endOffset,
        annotation.node.innerText.length
      );

      return { firstPart, secondPart, thirdPart };
    } else {
      const firstPart = '';
      const secondPart = annotation.node.innerText.slice(
        0,
        annotation.node.innerText.length
      );
      const thirdPart = '';

      return { firstPart, secondPart, thirdPart };
    }
  }
}
