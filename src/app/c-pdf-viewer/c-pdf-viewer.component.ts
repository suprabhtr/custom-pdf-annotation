import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { fromEvent } from 'rxjs';
import { switchMap, takeUntil, pairwise } from 'rxjs/operators';
import { AnnotationType } from '../annotationUtil';
interface IAnnotation {
  pageNumber: string;
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
export class CPdfViewerComponent implements OnInit, AfterViewInit {
  blackColor = 'rgba(0,0,0,1)';
  pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  pages: any = [];
  cx: any = {};
  zoom = 0.75;
  color = 'rgba(255, 255, 0, 1)';
  date = 'Date';
  annotations: IAnnotation[] = [];
  username = 'Lorem';
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
  constructor(private router: ActivatedRoute) {
    this.annotations = localStorage.getItem('annotations')!
      ? JSON.parse(localStorage.getItem('annotations')!)
      : [];
  }

  ngOnInit(): void {
    this.router.queryParams.subscribe((params: Params) => {
      this.pdfSrc = params['pdfURL'] || this.pdfSrc;
    });
  }

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.pages = document.querySelectorAll('[data-page-number]');
      const textLayers: any = document.querySelectorAll("[class='textLayer']");
      this.pages.forEach((page: any, index: number) => {
        // create a new canvas and append it in the page..

        if (textLayers[index] && textLayers[index].style!) {
          textLayers[index].style.zIndex = '1';
        }

        const canvas = document.createElement('canvas');
        canvas.style.height = page.style.height;
        canvas.style.width = page.style.width;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.right = '0';
        canvas.style.bottom = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '1000';
        canvas.style.border = '1px solid';
        canvas.setAttribute('class', 'free-hand-drawing');
        canvas.setAttribute('id', index.toString());
        this.cx[index] = canvas.getContext('2d');
        page.appendChild(canvas);
        if (!this.cx) throw 'Cannot get context';

        this.captureEvents(canvas);
      });
    }, 1000);
  }

  private captureEvents(canvasEl: HTMLCanvasElement) {
    // this will capture all mousedown events from the canvas element
    const id = canvasEl.id;
    fromEvent(canvasEl, 'mousedown')
      .pipe(
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(canvasEl, 'mousemove').pipe(
            // we'll stop (and unsubscribe) once the user releases the mouse
            // this will trigger a 'mouseup' event
            takeUntil(fromEvent(canvasEl, 'mouseup')),
            // we'll also stop (and unsubscribe) once the mouse leaves the canvas (mouseleave event)
            takeUntil(fromEvent(canvasEl, 'mouseleave')),
            // pairwise lets us get the previous value to draw a line from
            // the previous point to the current point
            pairwise()
          );
        })
      )
      .subscribe((res) => {
        const rect = canvasEl.getBoundingClientRect();
        const prevMouseEvent = res[0] as MouseEvent;
        const currMouseEvent = res[1] as MouseEvent;

        // previous and current position with the offset
        const prevPos = {
          x: prevMouseEvent.clientX - rect.left,
          y: prevMouseEvent.clientY - rect.top,
        };

        const currentPos = {
          x: currMouseEvent.clientX - rect.left,
          y: currMouseEvent.clientY - rect.top,
        };

        // this method we'll implement soon to do the actual drawing
        this.drawOnCanvas(prevPos, currentPos, id);
      });
  }

  private drawOnCanvas(
    prevPos: { x: number; y: number },
    currentPos: { x: number; y: number },
    id: string
  ) {
    if (!this.cx[id]) {
      return;
    }

    this.cx[id].beginPath();
    console.log(
      `Prev X: ${prevPos.x} Y: ${prevPos.y}, Current X: ${currentPos.x} Y: ${currentPos.y}`
    );

    if (prevPos) {
      this.cx[id].lineWidth = 3;
      this.cx[id].strokeStyle = this.color;
      this.cx[id].moveTo(prevPos.x, prevPos.y); // from
      this.cx[id].lineTo(currentPos.x, currentPos.y);
      this.cx[id].stroke();
    }
  }

  toggleDrawingMode() {
    this.pages.forEach((page: any, index: number) => {
      const textLayer = page.querySelector("[class='textLayer']");
      const drawingLayer = page.querySelector("[class='free-hand-drawing']");
      if (textLayer) {
        const temp = textLayer.style.zIndex;
        textLayer.style.zIndex = drawingLayer.style.zIndex;
        drawingLayer.style.zIndex = temp;
      }
    });
  }

  modifyTextLayerStyles() {
    let textLayers: any = document.getElementsByClassName('textLayer');
    textLayers = Array.prototype.slice.call(textLayers);
    for (let layer of textLayers) {
      layer.style.opacity = 0.5;
    }
  }
  textLayerRendered(event: any) {
    const textLayer = event.source.textLayerDiv;
    textLayer.style.opacity = 0.5;
    this.populateAnnotationsOnRenderedPage(event.pageNumber.toString());
  }

  populateAnnotationsOnRenderedPage(pageNumber: string) {
    this.annotations.forEach((annotation: IAnnotation, index: number) => {
      if (annotation.pageNumber !== pageNumber) {
        return;
      }
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
            } else if (annotation.metaData.type === AnnotationType.underline) {
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
  }

  getNode(nodePath: number[]) {
    let parent: any = document.querySelector('body');

    nodePath.forEach((item: number) => {
      parent = parent?.children[item];
    });
    return parent;
  }

  handleSelectionError(userSelection: any) {
    if (
      (!userSelection.anchorNode && !userSelection.focusNode) ||
      (userSelection.anchorNode &&
        userSelection.anchorNode.nodeName === 'APP-ROOT')
    ) {
      return true;
    } else {
      return false;
    }
  }

  highlightSelection() {
    const userSelection: any = window.getSelection();
    if (this.handleSelectionError(userSelection)) {
      return;
    }
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

    const { pageNumber, path: parentToChild } = this.getPath(targetNode);
    const { path: parentToChildEndNode } = this.getPath(endNode);
    const middleNodes = this.getInBetweenNodes(targetNode, endNode);

    const nodes =
      parentToChild.toString() === parentToChildEndNode.toString()
        ? [parentToChild]
        : [parentToChild, ...middleNodes, parentToChildEndNode];
    const targetText = newNode.innerText;
    const nodeData = {
      pageNumber,
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
    window.location.reload();
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
    const nodesPath = this.annotations[index].targetNodeParentToChild;
    const nodes = nodesPath?.map((nodePath: number[]) =>
      this.getNode(nodePath)
    );
    nodes?.forEach((node: any) => {
      let innerText = '';
      node.childNodes.forEach((childNode: any) => {
        if (childNode.nodeName === '#text') {
          innerText += childNode.data;
        } else {
          innerText += childNode.innerText;
        }
      });
      node.innerHTML = innerText;
    });

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
    if (this.handleSelectionError(userSelection)) {
      return;
    }
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
    const { pageNumber, path: parentToChild } = this.getPath(targetNode);
    const { path: pathToLast } = this.getPath(endNode);
    const middleNodes = this.getInBetweenNodes(targetNode, endNode);
    const nodes =
      targetNode === endNode
        ? [parentToChild]
        : [parentToChild, ...middleNodes, pathToLast];
    const targetText = newNode.innerText;

    const nodeData = {
      pageNumber,
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
        const { path } = this.getPath(current);
        middleNodes.push(path);
      }
      current = current.nextSibling;
    }
    return middleNodes;
  }

  getPath(currentNode: any) {
    const root = document.querySelector('body');
    let pageNumber = '';
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
        if (node.className === 'page') {
          pageNumber = node.attributes['data-page-number'].value;
        }
        node = parent; // Now we're moving up so now the current node will be the parent node...and the process will be repeated
      }

      return path;
    }

    const path = getPath(root, currentNode);
    path.reverse();
    return { path, pageNumber };
  }

  scrollIntoView(pageNumber: string) {
    console.log(pageNumber);
    const page = document.querySelector(`[data-page-number="${pageNumber}"]`)!;
    page.scrollIntoView({
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
