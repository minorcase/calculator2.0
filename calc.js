/**
 * Created by thomascase on 4/25/16.
 */
var current_type = null;
var current_val = '';
var stored_operator = null; //used for multiple presses of the equals sign
var stored_operand = null;

function Node(value, type, previous, next) {
    // console.log('making new node with: ' + value + ' type: ' + type);
    this.value = value;
    this.type = type;
    this.next = next;
    this.prev = previous;
    // console.log('node created. Values: ' , this.value, this.type, this.next, this.prev);
}
Node.prototype.delete_self = function(){
    this.value = null;
    this.type = null;
    this.next = null;
    this.prev = null;
};

var head = new Node(null, null, null, null);


var has_decimal = false; //boolean to control how many decimals get entered
function user_input() {
    var display = $('.top_display');
    var temp_text = $(display).text();
    var clicked = $(this);
    var clicked_type = $(clicked).attr('data-type');
    var clicked_value = $(clicked).html();
    console.log('input logged: ' + clicked_value);
    if (current_type == null) { //nothing has been clicked yet so it will only accept numbers.
        if (clicked_type == 'num') {

            if(clicked_value == '.'){
                if (has_decimal === false){
                    has_decimal = true;
                }
                else{
                    return;
                }
            }
            current_type = 'num';
            current_val = clicked_value;
            temp_text += clicked_value;
            $(display).text(temp_text);
        }
        else {
            return;
        }
    }
    else if (current_type == 'num') { //if it's a number...
        if (clicked_type == 'num') { //and we press another number, we just add that digit onto the current number

            if(clicked_value == '.'){
                if (has_decimal === false){
                    has_decimal = true;
                }
                else{
                    return;
                }
            }
            current_val += clicked_value;
            temp_text += clicked_value;
            $(display).text(temp_text);
        }
        else if (clicked_type == 'operator') { //and we press an operator then we have stopped inputting the number
            var number_node = new Node(current_val, current_type, null, null);
            add_node(number_node);
            current_type = 'operator';
            current_val = clicked_value;
            temp_text += clicked_value;
            $(display).text(temp_text);
        }
        else if (clicked_type == 'equals') { //and we press equals then we must have some math to do!
            //create a new node then do the math
            var number_node = new Node(current_val, current_type, null, null);
            add_node(number_node);
            process_list();
            current_type = 'equals';
            current_val = '';
        }
    }
    else if (current_type == 'operator') {//if we just pressed an operator...
        if (clicked_type == 'num') { // and we press a number then we have moved on to a new number
            //create a new node for the operator
            var op_node = new Node(current_val, current_type, null, null);
            add_node(op_node);
            current_val = clicked_value;
            current_type = 'num';
            temp_text += clicked_value;
            $(display).text(temp_text);
        }
        if (clicked_type == 'operator') { //and we press an operator then we should just replace the old operator
            current_val = clicked_value;
            temp_text = temp_text.substring(0, temp_text.length - 1);
            temp_text += clicked_value;
            $(display).text(temp_text);
        }
        if (clicked_type == 'equals') { //This is invalid input, do nothing and show error message
            return;
        }
    }
    else if (current_type == 'equals') { //we have just done some math... one node in the list which is the result of previous op
        if (clicked_type == 'num') {
            if(clicked_value == '.'){
                if (has_decimal === false){
                    has_decimal = true;
                }
                else{
                    return;
                }
            }
            head.next = null;
            $(display).text(clicked_value);
            //start from the beginning: toss out the node in the list
            current_val = clicked_value;
            current_type = 'num';

        }
        if (clicked_type == 'operator') {
            //leave the existing node alone
            var temp = $(display).text() + clicked_value;
            $(display).text(temp);
            current_val = clicked_value;
            current_type = 'operator';
        }
        if (clicked_type == 'equals') {
            redo_math();
        }
    }
}

function process_list() {
    console.log('list processing. list head: ', head);
    //parse for multiply/divide operations
    //parse for add/subtract operations
    var current_node = head;
    var temp_result;
    while (current_node.next != null) { //parse the list once for multiply divide ops
        current_node = current_node.next;
        if (current_node.value == '*') {
            stored_operator = current_node.value;
            stored_operand = current_node.next.value;
            console.log('mult');
            temp_result = multiply(current_node.prev.value, current_node.next.value);
            current_node = new Node(temp_result, 'num', current_node.prev.prev, current_node.next.next);
            current_node.prev.next = current_node;
            if (current_node.next != null) {
                current_node.next.prev = current_node;
            }
        }
        else if (current_node.value == '/') {
            stored_operator = current_node.value;
            stored_operand = current_node.next.value;
            console.log('div');
            temp_result = divide(current_node.prev.value, current_node.next.value);
            current_node = new Node(temp_result, 'num', current_node.prev.prev, current_node.next.next);
            current_node.prev.next = current_node;
            if (current_node.next != null) {
                current_node.next.prev = current_node;
            }
        }

    }
    //Parse a second time for add and subtract operations
    current_node = head;
    while (current_node.next != null) {
        current_node = current_node.next;
        if (current_node.value == '+') {
            stored_operator = current_node.value;
            stored_operand = current_node.next.value;
            console.log('add, current_node is: ', current_node);
            temp_result = add(current_node.prev.value, current_node.next.value);
            console.log('add temp_result: ' + temp_result);
            current_node = new Node(temp_result, 'num', current_node.prev.prev, current_node.next.next);
            current_node.prev.next = current_node;
            if (current_node.next != null) {
                current_node.next.prev = current_node;
            }
        }
        else if (current_node.value == '-') {
            stored_operator = current_node.value;
            stored_operand = current_node.next.value;
            console.log('sub');
            temp_result = subtract(current_node.prev.value, current_node.next.value);
            current_node = new Node(temp_result, 'num', current_node.prev.prev, current_node.next.next);
            current_node.prev.next = current_node;
            if (current_node.next != null) {
                current_node.next.prev = current_node;
            }
        }

    }
    console.log('final result: ', head.next);
    $('.top_display').text(head.next.value);
}


function add(first, second) {
    var temp = Number(first) + Number(second);
    return temp;
}
function multiply(first, second) {
    return Number(first) * Number(second);
}
function subtract(first, second) {
    return Number(first) - Number(second);
}
function divide(first, second) {
    return Number(first) / Number(second);
}

function redo_math() {
    console.log(head.next);
    console.log('redo math: ', stored_operator, stored_operand);
    var temp_value = head.next.value;
    switch (stored_operator) {
        case'+':
            temp_value = add(temp_value, stored_operand);
            head.next.value = temp_value;
            break;
        case'-':
            head.next.value = subtract(temp_value, stored_operand);
            break;
        case'/':
            head.next.value = divide(temp_value, stored_operand);
            break;
        case'*':
            head.next.value = multiply(temp_value, stored_operand);
            break;
    }
    console.log(head.next);
    $('.top_display').text(head.next.value);
}


function clear_all() {
    current_val = '';
    //clear the linked list
    head.next = null;
    current_type = null;
    $('.top_display').text('');
}

function add_node(node_to_add) {
    var current_node = head; //start at the beginning
    while (current_node.next != null) { //find the last node in the list
        current_node = current_node.next;
    }
    current_node.next = node_to_add; //make last_node.next = node_to_add
    node_to_add.prev = current_node; //make node_to_add.prev = last_node
}

function SVG_from_list(linked_list_head){

}
$(document).ready(function () {


    console.log('doc ready');
    $(".btn").mouseup(function () {
        $(this).blur();
    });
    $('body').on('click', 'button', user_input);
});

