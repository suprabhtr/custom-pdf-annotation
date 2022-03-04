import { Component, OnInit } from '@angular/core';
import { AnnotationType } from '../annotationUtil';
interface IAnnotation {
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
  pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  // pdfSrc =
  //   'https://a207958-cf-pas-live-publicationassembly-execution-qa-use1.s3.amazonaws.com/f8963d8d-8349-4f00-9a52-a8459297d299/CET_BR_D2021-07-26_0053_1.pdf?response-content-disposition=inline&response-content-type=application%2Fpdf&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAWZWAOWAAVJZ4S32V%2F20220225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20220225T074626Z&X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEgaCXVzLWVhc3QtMSJHMEUCIQCjOkOeIqMJDii8OfF17BIYyT4LHjujdbOL2AqTL2DbHQIgIaOcOlWrd%2FPKEHAfAXhAj0au2%2BMFFXlJTOImqwT0Z0kqtgIIof%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARABGgw0Njc0ODEzMDkxODUiDNA635QwHFZR5P%2B8HiqKAqeD8HeQqY5Od2Np7t2vw4eW3iE0nTgZaXqnzP2g9RFa8Sx1EzcNjdZBbEmQLV5XRISyR87pXok2pqBUyqTCfeJYBFCZ2DZxY3Q23xLbKUAi0%2F4fzTJGeoj3fAI6lClZd1OGeabnxSAJIp%2FYqX2gkX9W4O%2BJPKj7HYHn5oTkX2PWzurSMbWVIsm9lP6R%2B1qjzH7Y8%2BX0gOzc8L%2BQSvpmDiw%2BUoHZU3o4a44oT3XYZiU88TEB3RpU%2BWGEAt5RPrY8SlBQx8iaRn7rGDz0DYjNNu8jbMrSxE1B2x4AH7PqJWyEALm131SUiJ1EbdVZ8cju4JaI9rsxvyb3nd1z%2B0KrVIPk1RWKSJBBDFa3MOGR4pAGOpoBRw1M1xJ4GbSQatVSokhS2a0ijX8CIs%2F34B5JCpfB9uCVdTtd7igoAQO4F%2F%2FyEULVEtAaL4cuksfVQIW0aqrvv%2Bd8q7l%2BqDkN1%2Fcxz7BOKZrvBtKBkAudDm4fp67UnUSh%2BjENnSVDKQTAK%2FYcaHhGOGNiX47sEwOM8CizzFk1Tp5T%2BptDx%2F41NIQ07bQRunFPAMj1P2u8PpfinQ%3D%3D&X-Amz-Signature=10f0b86f0715e75a41e7dca35db9fa36246219e9d12b07585adea0dfd23bd266';

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
    if (JSON.parse(localStorage.getItem('annotations')!)) {
      setTimeout(() => {
        this.annotations = JSON.parse(localStorage.getItem('annotations')!);
        this.annotations.forEach((annotation: IAnnotation, index: number) => {
          const node = this.getNode(annotation.targetNodeParentToChild!);
          annotation.node = node;
          annotation.node.innerText = annotation.node.innerText.slice(
            annotation.offset!.startOffset,
            annotation.offset!.endOffset
          );
          annotation.node.style.background = annotation.backgroundColor!;
        });
      }, 1000);
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
    const nodeData = {
      targetNodeParentToChild: parentToChild,
      node: newNode,
      offset: { startOffset: range.startOffset, endOffset: range.endOffset },
      backgroundColor: this.color,
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
  }

  getDate() {
    const date = new Date();
    const month = this.monthNames[date.getMonth()];
    return `${month} ${date.getDate()}, ${date.getFullYear()}`;
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

  annotateSelection(annotationType:number){
    const userSelection: any = window.getSelection();

    for (let i = 0; i < userSelection.rangeCount; i++) {
      //Copy the selection onto a new element and highlight it
      const node = this.annotateRange(
        userSelection.getRangeAt(i), /*.toString()*/
        annotationType
      );
      // Make the range into a variable so we can replace it
      const range = userSelection.getRangeAt(i);
      //Delete the current selection
      range.deleteContents();
      //Insert the copy
      range.insertNode(node);
    }

  }

  annotateRange(range:Range, type:number){
    const newNode = document.createElement('span');
    let showComment:boolean = false;
    let annotationType:string="";

    if(type==1){
      annotationType=AnnotationType.underline;
      newNode.setAttribute('style', `border-bottom: 0.2rem solid black !important;`);
    }
    else if(type==2){
      annotationType=AnnotationType.strikeThrough;
      newNode.setAttribute('style', `text-decoration: line-through !important;
      color: black;
      z-index: 1000;
      text-decoration-style: double;`);
    }
    else if(type==3){
      annotationType=AnnotationType.text;
      showComment=true;
      newNode.setAttribute('style', `background-color: ${this.color};`)
    }

    newNode.appendChild(range.cloneContents());

    const nodeData = {
      node: newNode,
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
}
